/**
 * Vytáhne z HTML inzerátu všechny fotky galerie, ne jen tu sdílecí.
 *
 * Pořadí zdrojů je od nejspolehlivějšího po nouzový:
 *   1. vložený JSON galerie — Sreality do stránky vkládá pole `"images":[…]`
 *      s adresami, rozměry i pořadím; přesnější zdroj neexistuje,
 *   2. JSON-LD `image` — používá ho část portálů,
 *   3. og:image + sken <img> — poslední záchrana, vrátí obvykle jednu fotku.
 */

const ICON_PATTERN = /icon|logo|sprite|pixel|spinner|placeholder|avatar|banner|\.svg(\?|$)/i;

/** `//host/…` a `/cesta` na plnou adresu; ostatní se vrací beze změny. */
export function absolutizeUrl(raw: string, pageUrl: string): string {
  if (!raw) return '';
  if (raw.startsWith('//')) return 'https:' + raw;
  if (raw.startsWith('/')) {
    try {
      return new URL(pageUrl).origin + raw;
    } catch {
      return '';
    }
  }
  return raw;
}

/** Vyřízne vyvážené `[...]` od pozice otevírací závorky. */
function sliceArray(text: string, from: number): string | null {
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') {
      depth--;
      if (depth === 0) return text.slice(from, i + 1);
    }
  }
  return null;
}

function fromEmbeddedJson(html: string, pageUrl: string): string[] {
  const key = '"images":';
  const at = html.indexOf(key);
  if (at === -1) return [];

  const raw = sliceArray(html, at + key.length);
  if (!raw) return [];

  try {
    const items = JSON.parse(raw) as { url?: string; order?: number }[];
    return items
      .filter((i) => typeof i?.url === 'string')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((i) => absolutizeUrl(i.url!, pageUrl));
  } catch {
    return [];
  }
}

function fromJsonLd(doc: Document, pageUrl: string): string[] {
  const out: string[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((tag) => {
    try {
      const parsed = JSON.parse(tag.textContent || '');
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        const img = node?.image ?? node?.photo;
        for (const one of Array.isArray(img) ? img : [img]) {
          const url = typeof one === 'string' ? one : one?.url;
          if (url) out.push(absolutizeUrl(url, pageUrl));
        }
      }
    } catch {
      /* poškozený blok přeskočíme */
    }
  });
  return out;
}

function fromImgTags(doc: Document, pageUrl: string): string[] {
  const out: string[] = [];

  const meta =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  if (meta) out.push(absolutizeUrl(meta, pageUrl));

  doc.querySelectorAll('img').forEach((img) => {
    // Galerie se načítají líně, skutečná adresa bývá v data-* atributu.
    const src =
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-original') ||
      '';
    if (!src || src.startsWith('data:') || ICON_PATTERN.test(src)) return;
    const abs = absolutizeUrl(src, pageUrl);
    if (abs.startsWith('http')) out.push(abs);
  });

  return out;
}

/**
 * @param limit strop, aby jeden inzerát s padesáti fotkami nezahltil úložiště
 */
export function extractListingPhotos(html: string, pageUrl: string, limit = 25): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const sources = [
    fromEmbeddedJson(html, pageUrl),
    fromJsonLd(doc, pageUrl),
    fromImgTags(doc, pageUrl),
  ];

  for (const found of sources) {
    // Stejná fotka se v HTML opakuje v několika velikostech — držíme první
    // výskyt, protože pořadí ze zdroje odpovídá pořadí v galerii.
    const unique = [...new Set(found.filter(Boolean))];
    if (unique.length > 0) return unique.slice(0, limit);
  }

  return [];
}

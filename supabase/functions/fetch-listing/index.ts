// Stáhne stránku (nebo JSON) inzerátu, aby ji prohlížeč mohl přečíst.
//
// Prohlížeč si stránku portálu sám nestáhne (CORS). Dřív to za nás dělala
// placená ScraperAPI přes vývojovou proxy Vite — v nasazené aplikaci proxy
// neexistuje a klíč by byl v kódu, který dostane každý návštěvník. Portály
// ale obyčejný serverový požadavek s hlavičkou prohlížeče obslouží, takže
// stačí tahle funkce.
//
// Makléř může vložit odkaz z libovolného realitního webu, proto tu není
// seznam povolených domén jako u mirror-photo. Místo něj: jen http(s), žádné
// IP adresy ani interní názvy, a každé přesměrování se kontroluje znovu.

const MAX_BYTES = 6 * 1024 * 1024;
const TIMEOUT_MS = 15000;
// Sreality neznámého návštěvníka pošle přes autologin a kontrolu robotů
// Seznamu a zpátky — dohromady 6–7 přesměrování, a každý skok nastaví cookie,
// kterou další skok čeká. Bez paměti na cookies se to zacyklí.
const MAX_REDIRECTS = 10;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

function publicHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  if (!h.includes('.')) return false;                          // localhost, intranet
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':')) return false; // IPv4 / IPv6 literál
  if (/\.(local|internal|localhost|lan|home|corp)$/.test(h)) return false;
  return true;
}

function checkUrl(raw: string): URL | string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return 'Neplatná adresa.';
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Jen odkazy http(s).';
  if (!publicHost(u.hostname)) return 'Tahle adresa nevede na veřejný web.';
  return u;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Použijte POST.' }, 405);

  let raw: string;
  try {
    raw = String((await req.json()).url || '').trim();
  } catch {
    return json({ error: 'Očekávám JSON { url }.' }, 400);
  }
  if (!raw) return json({ error: 'Chybí odkaz.' }, 400);

  let target = checkUrl(raw);
  if (typeof target === 'string') return json({ error: target }, 400);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res: Response | null = null;
    // Cookies žijí jen po dobu tohoto jednoho požadavku.
    const jar = new Map<string, string>([['sznconsent', '1']]);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(target.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
          'Accept-Language': 'cs-CZ,cs;q=0.9',
          // Seznam (Sreality) bez souhlasu s cookies vrátí jen souhlasovou lištu.
          Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
        },
      });
      for (const c of res.headers.getSetCookie()) {
        const pair = c.split(';')[0];
        const eq = pair.indexOf('=');
        if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        const next = checkUrl(new URL(res.headers.get('location')!, target).toString());
        if (typeof next === 'string') return json({ error: next }, 400);
        await res.body?.cancel();
        target = next;
        continue;
      }
      break;
    }
    if (!res) return json({ error: 'Stránka neodpověděla.' }, 502);

    // Prodané a stažené inzeráty vracejí 404/410, ale s celou stránkou —
    // ta se pořád dá přečíst, proto se status nekontroluje.
    const type = res.headers.get('content-type') || '';
    // JSON kvůli Sreality: jeho stránka z datacentra ukáže jen lištu souhlasu
    // s cookies, jeho datové API /api/v1/estates/{id} ne.
    if (type && !/html|xml|text|json/i.test(type)) {
      return json({ error: 'Odkaz nevede na webovou stránku.' }, 415);
    }

    const reader = res.body?.getReader();
    if (!reader) return json({ error: 'Prázdná odpověď.' }, 502);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        controller.abort();
        return json({ error: 'Stránka je příliš velká.' }, 413);
      }
      chunks.push(value);
    }
    const buf = new Uint8Array(size);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
    const body = new TextDecoder('utf-8').decode(buf);

    return json({ body, contentType: type, finalUrl: target.toString(), status: res.status });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    return json({ error: aborted ? 'Stránka se nenačetla včas.' : 'Stránku se nepodařilo stáhnout.' }, 502);
  } finally {
    clearTimeout(timer);
  }
});

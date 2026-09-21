// Import inzerátu z odkazu — bez AI a bez placených služeb.
//
// Stránku stáhne edge funkce `fetch-listing` (prohlížeč to kvůli CORS sám
// nedokáže) a tady se z ní vyčtou údaje:
//   • Sreality má datové API /api/v1/estates/{id} se strukturovanými údaji.
//     Jeho HTML stránka se ze serveru použít nedá — ukáže jen lištu souhlasu
//     s cookies. Pro jistotu umí parser číst i __NEXT_DATA__ z té stránky.
//   • Ostatní portály (iDNES, RE/MAX, Bezrealitky, …) zobrazují parametry
//     jako dvojice „popisek: hodnota". Ty se najdou v textu stránky.
// Parser pracuje jen s textem HTML (žádný DOM), aby šel ověřit i mimo
// prohlížeč na uložených stránkách.

import { supabase } from '@/lib/supabase';

export interface ParsedListing {
  address?: string;
  kind?: 'byt' | 'dům' | 'pozemek' | 'komerční' | 'garáž/ostatní';
  transaction?: 'prodej' | 'pronájem';
  price?: number;
  flat_layout?: string;
  flat_area?: number;
  floor?: string;
  ownership?: string;
  construction?: string;
  flat_condition?: string;
  flat_penb?: string;
  flat_features?: string[];
  flat_parking?: string;
  house_layout?: string;
  house_area?: number;
  land_area?: number;
  house_type?: string;
  floors_count?: number;
  house_features?: string[];
  house_condition?: string;
  house_penb?: string;
  land_size?: number;
  land_type?: string;
  land_utilities?: string[];
  land_access?: string;
  comm_subtype?: string;
  comm_floor_area?: number;
  comm_condition_equipment?: string;
  comm_parking_entrance?: string;
  comm_penb?: string;
  rent_deposit?: number;
  rent_fees_utilities?: number;
  rent_available_from?: string;
  rent_equipment?: string;
  facts_for_answers?: string;
  // Pole, která formulář umí převzít, ale žádný portál je zatím spolehlivě
  // neuvádí — zůstávají prázdná, dokud se nenajde zdroj.
  rent_duration?: string;
  commission_pct?: number;
  commission_val?: number;
  zoning_plan?: string;
  land_dimensions?: string;
}

// ─── stažení ────────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<{ body: string; finalUrl: string }> {
  const { data, error } = await supabase.functions.invoke('fetch-listing', { body: { url } });
  if (error) {
    let message = '';
    try {
      message = (await (error as { context?: Response }).context?.json())?.error ?? '';
    } catch {
      /* odpověď nebyla JSON */
    }
    throw new Error(message || 'Stránku se nepodařilo stáhnout.');
  }
  if (!data?.body || data.body.length < 200) throw new Error('Stránka vrátila prázdný obsah.');
  return { body: data.body, finalUrl: data.finalUrl || url };
}

/** Číslo inzerátu ze Sreality odkazu (poslední dlouhé číslo v cestě). */
function srealityId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)sreality\.cz$/.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(\d{5,})(?:\/|$)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export interface LoadedListing {
  parsed: ParsedListing;
  /** Adresy fotek galerie v pořadí inzerátu; null = vyčíst z `html`. */
  photos: string[] | null;
  html: string | null;
  pageUrl: string;
}

/** Stáhne a přečte inzerát. Fotky z HTML si volající vytáhne sám (potřebuje DOM). */
export async function loadListing(url: string): Promise<LoadedListing> {
  const id = srealityId(url);
  if (id) {
    const { body } = await fetchPage(`https://www.sreality.cz/api/v1/estates/${id}`);
    let result: Record<string, any> | undefined;
    try {
      result = JSON.parse(body)?.result;
    } catch {
      /* ne-JSON odpověď */
    }
    if (!result?.category_main_cb) throw new Error('Inzerát na Sreality se nepodařilo najít — možná už byl stažen.');
    const images = (Array.isArray(result.advert_images) ? result.advert_images : [])
      .filter((i: any) => typeof i?.url === 'string')
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((i: any) => (i.url.startsWith('//') ? 'https:' + i.url : i.url));
    return { parsed: clean(fromSreality(srealityApiToEstate(result))), photos: images, html: null, pageUrl: url };
  }
  const { body, finalUrl } = await fetchPage(url);
  return { parsed: parseListing(body, finalUrl), photos: null, html: body, pageUrl: finalUrl };
}

// ─── společné převodníky na hodnoty z našich nabídek ───────────────────────

const lc = (s: unknown) => String(s ?? '').toLowerCase().trim();

function toNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  const s = String(raw ?? '').replace(/\u00a0|\u200d|\s/g, '');
  const m = s.match(/\d+(?:[.,]\d+)?/);
  if (!m) return undefined;
  const n = Number(m[0].replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Cena: bere se jen číslo před měnou, ať se nechytí „za m²" nebo rok. */
function toPrice(raw: unknown): number | undefined {
  if (typeof raw === 'number') return raw > 0 ? raw : undefined;
  const s = String(raw ?? '').replace(/\u00a0|\u200d/g, ' ');
  if (/vyžádání|dohodou|info v rk/i.test(s)) return undefined;
  const m = s.match(/(\d[\d\s.]*\d|\d)\s*(?:,-|kč|czk|,--)/i) || s.match(/(\d[\d\s.]{3,}\d)/);
  if (!m) return undefined;
  const n = Number(m[1].replace(/[\s.]/g, ''));
  return n > 0 ? n : undefined;
}

function toLayout(raw: unknown): string | undefined {
  const s = lc(raw);
  if (!s) return undefined;
  if (/garson/.test(s)) return 'garsoniéra';
  if (/atyp/.test(s)) return 'atypické';
  const m = s.match(/(\d)\s*\+\s*(kk|1)/);
  if (m) {
    const n = Number(m[1]);
    return n >= 6 ? '6 a více' : `${n}+${m[2]}`;
  }
  if (/6\s*(pokoj|a více)|více pokoj/.test(s)) return '6 a více';
  return undefined;
}

function toHouseLayout(raw: unknown): string | undefined {
  const s = lc(raw);
  const m = s.match(/(\d)\s*\+\s*(kk|1)/);
  if (m) return Number(m[1]) >= 7 ? '7 a více' : `${m[1]}+${m[2]}`;
  if (/atyp/.test(s)) return 'atypické';
  return undefined;
}

function toOwnership(raw: unknown): string | undefined {
  const s = lc(raw);
  if (/osobn/.test(s)) return 'osobní';
  if (/družst|druzst/.test(s)) return 'družstevní';
  if (/svj/.test(s)) return 'SVJ';
  if (/státn|obecn/.test(s)) return 'státní / obecní';
  return undefined;
}

function toConstruction(raw: unknown): string | undefined {
  const s = lc(raw);
  if (/cihl/.test(s)) return 'cihla';
  if (/panel/.test(s)) return 'panel';
  if (/skelet/.test(s)) return 'skelet';
  if (/dřev|drev/.test(s)) return 'dřevostavba';
  if (/montov/.test(s)) return 'montovaná';
  if (/smíš|smis/.test(s)) return 'smíšená';
  if (/kamen/.test(s)) return 'kamenná';
  return undefined;
}

function toCondition(raw: unknown): string | undefined {
  const s = lc(raw);
  if (!s) return undefined;
  if (/po rekonstr/.test(s)) return 'po rekonstrukci';
  if (/před rekonstr|pred rekonstr|špatn|spatn/.test(s)) return 'před rekonstrukcí';
  if (/v rekonstr/.test(s)) return 'v rekonstrukci';
  if (/ve výstavb|ve vystavb/.test(s)) return 've výstavbě';
  if (/novostav/.test(s)) return 'novostavba';
  if (/projekt/.test(s)) return 'projekt';
  if (/demolic/.test(s)) return 'k demolici';
  if (/velmi dobr/.test(s)) return 'velmi dobrý';
  if (/dobr/.test(s)) return 'dobrý';
  return undefined;
}

function toPenb(raw: unknown): string | undefined {
  const s = String(raw ?? '').trim();
  const m = s.match(/(?:^|[^A-Za-z])([A-G])(?:$|[^A-Za-z])/);
  return m ? m[1] : undefined;
}

function toKind(text: string): ParsedListing['kind'] | undefined {
  const s = lc(text);
  if (/garáž|garaz|parkovací stání|parkovaci-stani/.test(s)) return 'garáž/ostatní';
  if (/\bbyt|\bbytu|\bbyty|garson|\/byt\//.test(s)) return 'byt';
  if (/\bdům|\bdomu|\bdomy|\bdum\b|\/dum\/|rodinn|\bvil[ay]\b|chalup|chat[ay]\b/.test(s)) return 'dům';
  if (/pozem/.test(s)) return 'pozemek';
  if (/komerč|komerc|kancelář|kancelar|obchodní prostor|sklad|výrob/.test(s)) return 'komerční';
  return undefined;
}

function toTransaction(text: string): ParsedListing['transaction'] | undefined {
  const s = lc(text);
  if (/pronáj|pronaj|nájem|najem/.test(s)) return 'pronájem';
  if (/prodej|dražb|drazb/.test(s)) return 'prodej';
  return undefined;
}

function toCzDate(raw: unknown): string | undefined {
  const s = String(raw ?? '');
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const cz = s.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (cz) return `${cz[3]}-${cz[2].padStart(2, '0')}-${cz[1].padStart(2, '0')}`;
  return undefined;
}

function cleanDescription(raw: unknown): string | undefined {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (s.length < 40) return undefined;
  return s.length > 1500 ? s.slice(0, 1500).replace(/\s\S*$/, '') + '…' : s;
}

// ─── Sreality: strukturovaná data ───────────────────────────────────────────

type Named = { name?: string; value?: number } | null | undefined;
const nm = (v: Named) => (v && typeof v === 'object' && v.value !== 0 ? v.name : undefined);
const setNames = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => lc((x as { name?: string })?.name)).filter(Boolean) : [];

function findSrealityEstate(html: string): Record<string, any> | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  let data: any;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return null;
  }
  const queries = data?.props?.pageProps?.dehydratedState?.queries;
  if (!Array.isArray(queries)) return null;
  for (const q of queries) {
    const d = q?.state?.data;
    if (d && typeof d === 'object' && d.categoryMainCb && d.params) return d;
  }
  return null;
}

/** API vrací ploché snake_case pole; převede se na tvar z __NEXT_DATA__. */
function srealityApiToEstate(r: Record<string, any>): Record<string, any> {
  const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const params: Record<string, any> = Object.fromEntries(Object.entries(r).map(([k, v]) => [camel(k), v]));
  params.energyEfficiencyRating = r.energy_efficiency_rating_cb;
  const loc = r.locality || {};
  return {
    categoryMainCb: r.category_main_cb,
    categorySubCb: r.category_sub_cb,
    categoryTypeCb: r.category_type_cb,
    price: r.price,
    priceCzk: r.price_czk,
    description: r.advert_description,
    locality: {
      street: loc.street,
      houseNumber: loc.housenumber ?? loc.streetnumber,
      city: loc.city,
      cityPart: loc.citypart,
    },
    params,
  };
}

function fromSreality(e: Record<string, any>): ParsedListing {
  const p = e.params || {};
  const main = e.categoryMainCb?.value;
  const kind: ParsedListing['kind'] =
    main === 1 ? 'byt' : main === 2 ? 'dům' : main === 3 ? 'pozemek' : main === 4 ? 'komerční' : 'garáž/ostatní';
  const sub = lc(e.categorySubCb?.name);
  const out: ParsedListing = {
    kind,
    transaction: e.categoryTypeCb?.value === 2 ? 'pronájem' : 'prodej',
    price: toNumber(e.priceCzk ?? e.price),
    facts_for_answers: cleanDescription(e.description),
  };

  const loc = e.locality || {};
  const street = [loc.street, loc.houseNumber].filter(Boolean).join(' ');
  const place = loc.cityPart && loc.cityPart !== loc.city ? `${loc.city} – ${loc.cityPart}` : loc.city;
  out.address = [street, place].filter(Boolean).join(', ') || undefined;

  const penb = toPenb(nm(p.energyEfficiencyRating));
  const condition = toCondition(nm(p.buildingCondition));
  const usable = toNumber(p.usableArea) ?? toNumber(p.floorArea);

  if (kind === 'byt') {
    out.flat_layout = toLayout(e.categorySubCb?.name);
    out.flat_area = usable;
    if (typeof p.floorNumber === 'number') {
      const f = p.floorNumber === 0 ? 'přízemí' : `${p.floorNumber}. patro`;
      out.floor = typeof p.floors === 'number' && p.floors > 0 ? `${f} z ${p.floors}` : f;
    }
    out.ownership = toOwnership(nm(p.ownership));
    out.construction = toConstruction(nm(p.buildingType));
    out.flat_condition = condition;
    out.flat_penb = penb;
    const f: string[] = [];
    if (lc(nm(p.elevator)) === 'ano') f.push('výtah');
    if (p.balcony || p.loggia) f.push('balkon/lodžie');
    if (p.terrace) f.push('terasa');
    if (p.cellar) f.push('sklep');
    if (p.garage) f.push('garáž');
    if (p.parkingLots) f.push('parkovací stání');
    if (lc(nm(p.easyAccess)) === 'ano') f.push('bezbariérový');
    if (f.length) out.flat_features = f;
    if (p.garage || p.parkingLots) {
      out.flat_parking = p.garage ? 'garáž' : typeof p.parking === 'number' && p.parking > 0 ? `${p.parking} parkovací stání` : 'parkovací stání';
    }
  } else if (kind === 'dům') {
    out.house_area = usable;
    out.land_area = toNumber(p.estateArea);
    out.floors_count = typeof p.floors === 'number' && p.floors > 0 ? p.floors : undefined;
    out.house_condition = condition;
    out.house_penb = penb;
    const objKind = lc(nm(p.objectKind));
    out.house_type =
      /vila/.test(sub) ? 'vila'
      : /chalup|chat/.test(sub) ? 'chalupa / chata'
      : /zemědělsk|usedlost/.test(sub) ? 'zemědělská usedlost'
      : /rohov/.test(objKind) ? 'řadový — krajní'
      : /řadov/.test(objKind) ? 'řadový — vnitřní'
      : /samost/.test(objKind) ? 'samostatný'
      : undefined;
    const f: string[] = [];
    if (p.garage) f.push('garáž');
    if (p.parkingLots) f.push('parkovací stání');
    if (toNumber(p.gardenArea)) f.push('zahrada');
    if (p.basin) f.push('bazén');
    if (p.terrace) f.push('terasa');
    if (p.balcony) f.push('balkon');
    if (p.cellar) f.push('sklep');
    if (f.length) out.house_features = f;
  } else if (kind === 'pozemek') {
    out.land_size = toNumber(p.estateArea);
    const landTypes: [RegExp, string][] = [
      [/bydlen/, 'bydlení'], [/komer/, 'komerční'], [/pole/, 'pole'], [/louk/, 'louka'], [/les/, 'les'],
      [/rybn/, 'rybník'], [/sad|vinic/, 'sady / vinice'], [/zahrad/, 'zahrada'], [/ostat/, 'ostatní'],
    ];
    out.land_type = landTypes.find(([re]) => re.test(sub))?.[1];
    const u: string[] = [];
    const water = setNames(p.waterSet);
    if (water.some((w) => /vodovod|dálkov/.test(w))) u.push('voda');
    if (water.some((w) => /studn/.test(w))) u.push('studna');
    if (setNames(p.electricitySet).length) u.push('elektřina');
    if (setNames(p.gasSet).length) u.push('plyn');
    const gully = setNames(p.gullySet);
    if (gully.some((g) => /kanaliz/.test(g))) u.push('kanalizace');
    if (gully.some((g) => /čistič|cistic/.test(g))) u.push('čistička');
    if (setNames(p.telecommunicationSet).some((t) => /internet/.test(t))) u.push('internet');
    if (u.length) out.land_utilities = u;
    const road = setNames(p.roadTypeSet).join(' ');
    out.land_access =
      /asfalt/.test(road) ? 'asfaltová cesta'
      : /beton|dlážd|dlazd|šotolin|sotolin/.test(road) ? 'zpevněná cesta'
      : /neuprav/.test(road) ? 'nezpevněná cesta'
      : undefined;
  } else {
    const commTypes: [RegExp, string][] = [
      [/kancel/, 'kancelář'], [/obchod/, 'obchodní prostor'], [/sklad/, 'sklad'], [/výrob|vyrob/, 'výrobní prostor'],
      [/restaur/, 'restaurace / gastro'], [/ubytov/, 'ubytování'], [/ordinac/, 'ordinace'],
      [/zemědělsk|zemedelsk/, 'zemědělský objekt'], [/činžov|cinzov/, 'činžovní dům'],
      [/garážové stání|garazove stani/, 'garážové stání'], [/garáž|garaz/, 'garáž'],
      [/sklep|kóje|koje/, 'sklep / kóje'], [/vinn|ostat/, 'ostatní'],
    ];
    out.comm_subtype = commTypes.find(([re]) => re.test(sub))?.[1];
    out.comm_floor_area = usable;
    out.comm_condition_equipment = condition;
    out.comm_penb = penb;
    if (typeof p.parking === 'number' && p.parking > 0) out.comm_parking_entrance = `${p.parking} parkovací stání`;
  }

  if (out.transaction === 'pronájem') {
    const furnished = lc(nm(p.furnished));
    out.rent_equipment =
      furnished === 'ano' ? 'vybaveno' : /částeč|castec/.test(furnished) ? 'částečně vybaveno' : furnished === 'ne' ? 'nevybaveno' : undefined;
    out.rent_available_from = toCzDate(p.readyDate);
  }
  return out;
}

// ─── ostatní portály: dvojice „popisek: hodnota" v textu stránky ────────────

const ENTITIES: Record<string, string> = {
  nbsp: ' ', zwj: '', zwnj: '', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", sup2: '²', ndash: '–', mdash: '—',
};

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z0-9]+);/gi, (_, n) => ENTITIES[n.toLowerCase()] ?? '');
}

/** Viditelný text stránky, prvky oddělené „ | ", aby popisek a hodnota zůstaly rozlišitelné. */
function flatten(html: string): string {
  return decode(
    html
      .replace(/<(script|style|noscript|svg|iframe|template)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' | '),
  )
    .replace(/\u200d/g, '')
    .replace(/[ \t\r\n\u00a0]+/g, ' ')
    .replace(/(\s*\|\s*)+/g, ' | ');
}

function meta(html: string, prop: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]).trim() : undefined;
}

function firstTag(html: string, tag: string): string | undefined {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() : undefined;
}

/** Hodnota za popiskem: „Label | hodnota" nebo „Label: hodnota". */
function labelled(text: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|\\|)\\s*${esc}\\s*(?::\\s*(?:\\|\\s*)?|\\|\\s*)([^|]{1,90}?)\\s*(?=\\||$)`, 'i');
    const m = text.match(re);
    if (m && m[1].trim() && !/^:$/.test(m[1].trim())) return m[1].trim();
  }
  return undefined;
}

/**
 * Vybavení portály píšou jako samostatné štítky („| Sklep 9 m² | Výtah |"),
 * ne jako dvojice. Štítek tedy znamená „ano" — pokud za ním hned nestojí
 * „ne". Vrací text následující buňky (u parkování je to často popis), nebo
 * null, když štítek chybí nebo je zápor.
 */
function tag(text: string, words: string[]): string | null {
  for (const w of words) {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = text.match(new RegExp(`\\|\\s*${esc}(?:\\s+[\\d.,]+\\s*m[²2])?\\s*:?\\s*\\|\\s*([^|]*)`, 'i'));
    if (m) return /^(ne|není|nie|no)\b/i.test(m[1].trim()) ? null : m[1].trim();
  }
  return null;
}
const has = (text: string, words: string[]) => tag(text, words) !== null;
const PARKING_DESC = /parkov|stání|stani|garáž|garaz|ulic|dvůr|dvor|vlastní|místo/i;

/** Adresa z titulku/popisu: portály ji píšou za plochu („… 54 m², České Budějovice"). */
function addressFromTitle(candidates: (string | undefined)[]): string | undefined {
  for (const c of candidates) {
    if (!c) continue;
    // „²" není písmeno, takže \b za ním nefunguje — hranice se hlídá ručně.
    const m = c.match(/\d\s*m[²2](?![\p{L}\d])\s*(.*)$/u);
    if (!m) continue;
    const a = m[1]
      .replace(/\(ID[^)]*\)/gi, ' ')
      .split(/\s\|\s/)[0]
      // konec věty = tečka a za ní slovo s velkým písmenem a mezerou;
      // „nám. Svobody," tím neuřízne, „kraj. Nabízíme …" ano
      .split(/\.\s+(?=\p{Lu}\p{Ll}+\s)/u)[0]
      .replace(/\bbez (realitky|RK)\b/gi, ' ')
      .replace(/^[\s,;:–\-]*(na adrese|v ulici|adresa)\s+/i, '')
      .replace(/\s*[•·]\s*/g, ', ')
      .replace(/^[\s,;:–\-]+|[\s,;:–\-.]+$/g, '')
      .replace(/(,\s*)+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    const looksLikePlace = /^(\p{Lu}|nám\.|ul\.|tř\.|nábř\.)/u.test(a);
    if (looksLikePlace && a.length >= 3 && a.length <= 90) return a;
  }
  return undefined;
}

function fromGeneric(html: string, url: string): ParsedListing {
  const text = flatten(html);
  const title = [firstTag(html, 'h1'), meta(html, 'og:title'), firstTag(html, 'title')].filter(Boolean).join(' · ');
  const head = `${decodeURIComponent(url)} ${title}`;
  const out: ParsedListing = {};

  out.kind = toKind(head) ?? toKind(labelled(text, ['Typ nemovitosti', 'Druh nemovitosti', 'Kategorie']) ?? '');
  out.transaction = toTransaction(head) ?? toTransaction(labelled(text, ['Typ nabídky', 'Typ transakce']) ?? '') ?? 'prodej';

  out.price = toPrice(
    labelled(text, ['Celková cena', 'Cena nemovitosti', 'Cena', 'Nájemné', 'Měsíční nájem', 'Nájem', 'Požadovaná cena']) ?? '',
  ) ?? toPrice(meta(html, 'product:price:amount'));

  const addr = labelled(text, ['Adresa']);
  const ogDesc = meta(html, 'og:description') ?? meta(html, 'description');
  out.address =
    (addr && addr.length > 3 && !/mapa|zobrazit/i.test(addr) ? addr : undefined) ??
    addressFromTitle([ogDesc, firstTag(html, 'h1'), meta(html, 'og:title'), firstTag(html, 'title')]);

  const layoutText = labelled(text, ['Dispozice', 'Počet pokojů', 'Velikost']) ?? title;
  const usable = toNumber(labelled(text, ['Užitná plocha', 'Plocha užitná', 'Podlahová plocha', 'Obytná plocha', 'Celková plocha', 'Plocha']));
  const landArea = toNumber(labelled(text, ['Plocha pozemku', 'Výměra pozemku', 'Výměra', 'Plocha parcely', 'Pozemek']));
  const condition = toCondition(labelled(text, ['Stav objektu', 'Stav budovy', 'Stav nemovitosti', 'Stav bytu', 'Stav domu', 'Stav']));
  const penb = toPenb(labelled(text, ['Energetická náročnost budovy', 'Energetická náročnost', 'Třída energetické náročnosti', 'Energetická třída', 'PENB']));
  const construction = toConstruction(labelled(text, ['Konstrukce budovy', 'Typ stavby', 'Konstrukce', 'Stavba', 'Materiál']));

  if (out.kind === 'byt') {
    out.flat_layout = toLayout(layoutText);
    out.flat_area = usable ?? toNumber((title.match(/(\d+[.,]?\d*)\s*m[²2]/) || [])[1]);
    out.floor = labelled(text, ['Podlaží', 'Patro', 'Číslo podlaží', 'Umístění v domě']);
    out.ownership = toOwnership(labelled(text, ['Vlastnictví', 'Typ vlastnictví', 'Forma vlastnictví']));
    out.construction = construction;
    out.flat_condition = condition;
    out.flat_penb = penb;
    const f: string[] = [];
    if (has(text, ['Výtah'])) f.push('výtah');
    if (has(text, ['Balkon', 'Balkón', 'Lodžie'])) f.push('balkon/lodžie');
    if (has(text, ['Terasa'])) f.push('terasa');
    if (has(text, ['Sklep'])) f.push('sklep');
    if (has(text, ['Garáž'])) f.push('garáž');
    const parking = tag(text, ['Parkování', 'Parkovací stání']);
    if (parking !== null) {
      f.push('parkovací stání');
      if (PARKING_DESC.test(parking)) out.flat_parking = parking;
    }
    if (f.length) out.flat_features = f;
  } else if (out.kind === 'dům') {
    out.house_layout = toHouseLayout(layoutText);
    out.house_area = usable ?? toNumber((title.match(/(\d+[.,]?\d*)\s*m[²2]/) || [])[1]);
    out.land_area = landArea;
    out.floors_count = toNumber(labelled(text, ['Počet podlaží', 'Podlažnost', 'Počet nadzemních podlaží']));
    out.house_condition = condition;
    out.house_penb = penb;
    const t = lc(`${labelled(text, ['Typ domu', 'Poloha domu', 'Druh objektu', 'Typ objektu']) ?? ''} ${title}`);
    out.house_type =
      /vila/.test(t) ? 'vila'
      : /chalup|chat/.test(t) ? 'chalupa / chata'
      : /rohov|krajn/.test(t) ? 'řadový — krajní'
      : /řadov|radov/.test(t) ? 'řadový — vnitřní'
      : /dvojdom/.test(t) ? 'dvojdomek'
      : /samostat/.test(t) ? 'samostatný'
      : undefined;
    const f: string[] = [];
    if (has(text, ['Garáž'])) f.push('garáž');
    if (has(text, ['Parkování', 'Parkovací stání'])) f.push('parkovací stání');
    if (has(text, ['Zahrada', 'Plocha zahrady'])) f.push('zahrada');
    if (has(text, ['Bazén'])) f.push('bazén');
    if (has(text, ['Terasa'])) f.push('terasa');
    if (has(text, ['Sklep'])) f.push('sklep');
    if (f.length) out.house_features = f;
  } else if (out.kind === 'pozemek') {
    out.land_size = landArea ?? usable;
    const lt = lc(`${labelled(text, ['Druh pozemku', 'Typ pozemku']) ?? ''} ${title}`);
    out.land_type =
      /bydlen|stavebn/.test(lt) ? 'bydlení' : /komer/.test(lt) ? 'komerční' : /pole|orn/.test(lt) ? 'pole'
      : /louk/.test(lt) ? 'louka' : /les/.test(lt) ? 'les' : /zahrad/.test(lt) ? 'zahrada'
      : /sad|vinic/.test(lt) ? 'sady / vinice' : undefined;
    const u: string[] = [];
    if (has(text, ['Voda', 'Vodovod'])) u.push('voda');
    if (has(text, ['Elektřina', 'Elektro'])) u.push('elektřina');
    if (has(text, ['Plyn', 'Plynovod'])) u.push('plyn');
    if (has(text, ['Kanalizace', 'Odpad'])) u.push('kanalizace');
    if (u.length) out.land_utilities = u;
  } else if (out.kind) {
    out.comm_floor_area = usable;
    out.comm_condition_equipment = condition;
    out.comm_penb = penb;
  }

  if (out.transaction === 'pronájem') {
    out.rent_deposit = toPrice(labelled(text, ['Vratná kauce', 'Kauce', 'Jistota']) ?? '');
    out.rent_fees_utilities = toPrice(labelled(text, ['Poplatky za služby', 'Měsíční poplatky', 'Poplatky', 'Služby']) ?? '');
    out.rent_available_from = toCzDate(labelled(text, ['K nastěhování od', 'Dostupné od', 'Datum nastěhování', 'Volné od']));
    const eq = lc(labelled(text, ['Vybavení', 'Vybaveno']));
    out.rent_equipment = /částeč|castec/.test(eq) ? 'částečně vybaveno' : /^ne|nevybav/.test(eq) ? 'nevybaveno' : /^ano|vybav/.test(eq) ? 'vybaveno' : undefined;
  }

  // Některé weby mají stejný popis na všech stránkách — ten k inzerátu nepatří.
  if (ogDesc && /m[²2]|\d\s*\+\s*(kk|1)|kč/i.test(ogDesc)) out.facts_for_answers = cleanDescription(ogDesc);
  return out;
}

/** Vyčte inzerát ze stažené stránky. Prázdná pole se do výsledku nedostanou. */
export function parseListing(html: string, url: string): ParsedListing {
  const estate = findSrealityEstate(html);
  return clean(estate ? fromSreality(estate) : fromGeneric(html, url));
}

function clean(p: ParsedListing): ParsedListing {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  ) as ParsedListing;
}

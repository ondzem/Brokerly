// Stáhne fotku z inzerátu a uloží ji do našeho úložiště.
//
// Proč vůbec server: portály posílají obrázky bez hlavičky CORS, takže se k nim
// prohlížeč nedostane — ověřeno na Sreality i RE/MAX, obojí „Failed to fetch".
//
// Endpoint fetchuje adresu, kterou dostane, což je klasická díra typu SSRF.
// Proto pouští jen https a jen domény portálů, ze kterých import čte.

const ALLOWED_HOST_SUFFIXES = [
  'sreality.cz', 'seznam.cz', 'sdn.cz',          // Sreality a jeho CDN
  '1gr.cz', 'idnes.cz',                          // iDNES Reality
  'remax-czech.cz',                              // RE/MAX
  'bezrealitky.cz', 'bezrealitky.com',
  'ulovdomov.cz', 'ceskereality.cz', 'reality.cz',
];

const MAX_BYTES = 15 * 1024 * 1024;
const BUCKET = 'property-photos';

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

function hostAllowed(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((s) => h === s || h.endsWith('.' + s));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Použijte POST.' }, 405);

  // `urls` je seznam kandidátů od nejlepšího po nejhorší: klient nabídne
  // adresu velké verze a jako zálohu původní. Hádání velikosti tak nikdy
  // nezpůsobí ztrátu fotky — když velká neexistuje, vezme se ta původní.
  let candidates: string[];
  try {
    const body = await req.json();
    candidates = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : [];
  } catch {
    return json({ error: 'Očekávám JSON { url } nebo { urls: [] }.' }, 400);
  }
  if (candidates.length === 0) return json({ error: 'Chybí url.' }, 400);

  let upstream: Response | null = null;
  let parsed: URL | null = null;
  const problems: string[] = [];

  for (const candidate of candidates.slice(0, 4)) {
    let u: URL;
    try {
      u = new URL(candidate);
    } catch {
      problems.push('neplatná adresa');
      continue;
    }
    if (u.protocol !== 'https:') { problems.push('jen https'); continue; }
    if (!hostAllowed(u.hostname)) { problems.push(`doména ${u.hostname} není povolená`); continue; }

    // Portály odmítají požadavky bez hlavičky prohlížeče. Stahuje se původní
    // řetězec — u.toString() by zakódoval `|` v parametru fl a Seznam by
    // takovou adresu odmítl.
    const res = await fetch(candidate, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: u.origin + '/',
      },
    }).catch(() => null);

    if (res && res.ok) { upstream = res; parsed = u; break; }
    problems.push(`${u.pathname.split('/').pop()}: ${res?.status ?? 'bez odpovědi'}`);
  }

  if (!upstream || !parsed) {
    return json({ error: `Fotku se nepodařilo stáhnout — ${problems.join(' · ')}` }, 502);
  }

  const type = (upstream.headers.get('content-type') || '').split(';')[0].trim();
  if (!type.startsWith('image/')) {
    return json({ error: `Adresa nevrací obrázek, ale ${type || 'neznámý typ'}.` }, 415);
  }

  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.byteLength === 0) return json({ error: 'Prázdný soubor.' }, 502);
  if (bytes.byteLength > MAX_BYTES) return json({ error: 'Fotka je větší než 15 MB.' }, 413);

  const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' })[type] ?? 'jpg';
  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const projectUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const put = await fetch(`${projectUrl}/storage/v1/object/${BUCKET}/${key}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': type,
      'Cache-Control': 'max-age=31536000',
    },
    body: bytes,
  });

  if (!put.ok) {
    return json({ error: `Uložení selhalo: ${await put.text()}` }, 500);
  }

  return json({
    url: `${projectUrl}/storage/v1/object/public/${BUCKET}/${key}`,
    bytes: bytes.byteLength,
    type,
  });
});

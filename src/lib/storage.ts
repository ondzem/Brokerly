import { supabase } from './supabase';

export const PROPERTY_PHOTO_BUCKET = 'property-photos';

/**
 * Cílový rozměr fotek — všechny se ořezávají na stejný poměr i velikost.
 * Poměr 3:2 = přirozený formát fotoaparátů, u nemovitostí standard.
 * Změna poměru = změna těchto dvou čísel, zbytek (ořez i výřez) se dopočítá.
 */
export const PHOTO_TARGET_WIDTH = 1200;
export const PHOTO_TARGET_HEIGHT = 800;
export const PHOTO_ASPECT = PHOTO_TARGET_WIDTH / PHOTO_TARGET_HEIGHT;

/**
 * Náhled do mřížky. Dlaždice má na desktopu kolem 300 px, takže plná fotka
 * je zbytečně velká — mřížka z 25 fotek jinak stáhne přes 1,5 MB.
 */
export const THUMB_WIDTH = 480;
export const THUMB_HEIGHT = Math.round(THUMB_WIDTH / PHOTO_ASPECT);
const THUMB_SUFFIX = '_thumb';

/** Adresa náhledu se odvozuje od adresy fotky, aby nebylo nutné měnit schéma. */
export function thumbUrlFor(url: string): string {
  if (!isStoredPhotoUrl(url)) return url;
  return url.replace(/\.(jpg|jpeg|png|webp)(\?|$)/i, `${THUMB_SUFFIX}.$1$2`);
}

function isStoredPhotoUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${PROPERTY_PHOTO_BUCKET}/`);
}

/** Zmenší už načtený obrázek na náhled. */
function scaleToBlob(image: CanvasImageSource, width: number, height: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Prohlížeč nepodporuje canvas.'));
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Náhled se nepodařilo vytvořit.'))), 'image/jpeg', quality)
  );
}

/**
 * Nahraje oříznutou fotku do Supabase Storage a vrátí veřejnou URL.
 * Chybu bucketu hlásíme srozumitelně — bez spuštěné migrace neexistuje.
 */
export async function uploadPropertyPhoto(blob: Blob): Promise<string> {
  const stem = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const name = `${stem}.jpg`;

  const { error } = await supabase.storage
    .from(PROPERTY_PHOTO_BUCKET)
    .upload(name, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });

  if (error) {
    const message = error.message || '';
    if (/bucket.*not.*found/i.test(message)) {
      throw new Error(
        'Úložiště fotek zatím není v Supabase založené. Spusťte migraci supabase/migrations/20260818150000_add_property_photos_bucket.sql.'
      );
    }
    throw new Error(`Nahrání fotky selhalo: ${message}`);
  }

  // Náhled nahráváme rovnou vedle fotky. Selhání tu nesmí shodit uložení —
  // mřížka si v takovém případě vezme plnou fotku.
  try {
    const bitmap = await createImageBitmap(blob);
    const thumb = await scaleToBlob(bitmap, THUMB_WIDTH, THUMB_HEIGHT, 0.72);
    bitmap.close();
    await supabase.storage
      .from(PROPERTY_PHOTO_BUCKET)
      .upload(`${stem}${THUMB_SUFFIX}.jpg`, thumb, { contentType: 'image/jpeg', cacheControl: '31536000' });
  } catch (e) {
    console.warn('Náhled se nevytvořil, mřížka použije plnou fotku:', e);
  }

  const { data } = supabase.storage.from(PROPERTY_PHOTO_BUCKET).getPublicUrl(name);
  return data.publicUrl;
}

/**
 * Dodělá náhled k fotce, která už v úložišti leží (přenesená z inzerátu nebo
 * nahraná dřív, než náhledy existovaly). Vrací true, když náhled vznikl.
 */
export async function ensureThumb(photoUrl: string): Promise<boolean> {
  if (!isStoredPhotoUrl(photoUrl)) return false;

  const key = decodeURIComponent(
    photoUrl.split(`/storage/v1/object/public/${PROPERTY_PHOTO_BUCKET}/`)[1]?.split('?')[0] ?? ''
  );
  if (!key || key.includes(THUMB_SUFFIX)) return false;

  const thumbKey = key.replace(/\.(jpg|jpeg|png|webp)$/i, `${THUMB_SUFFIX}.$1`);

  // Náš bucket posílá hlavičku CORS, takže se obrázek dá vzít na canvas.
  const res = await fetch(photoUrl);
  if (!res.ok) return false;
  const bitmap = await createImageBitmap(await res.blob());
  const thumb = await scaleToBlob(bitmap, THUMB_WIDTH, THUMB_HEIGHT, 0.72);
  bitmap.close();

  const { error } = await supabase.storage
    .from(PROPERTY_PHOTO_BUCKET)
    .upload(thumbKey, thumb, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true });
  return !error;
}

/** Vyřízne zvolenou oblast a přeškáluje ji na jednotný rozměr. */
export function cropToBlob(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_TARGET_WIDTH;
  canvas.height = PHOTO_TARGET_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Prohlížeč nepodporuje canvas.'));

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    PHOTO_TARGET_WIDTH,
    PHOTO_TARGET_HEIGHT
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Ořez fotky se nepodařil.'))),
      'image/jpeg',
      0.86
    );
  });
}

export const PROPERTY_DOCUMENT_BUCKET = 'property-documents';
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/**
 * Nahraje dokument (LV, PENB, smlouva) a vrátí veřejnou URL.
 * Původní název souboru se do klíče nepromítá — může kolidovat i obsahovat
 * znaky, které Storage neunese; drží se zvlášť v poli `documents`.
 */
export async function uploadPropertyDocument(file: File): Promise<string> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error(`Soubor je větší než 20 MB (${Math.round(file.size / 1048576)} MB).`);
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(PROPERTY_DOCUMENT_BUCKET)
    .upload(key, file, { contentType: file.type || 'application/octet-stream' });

  if (error) {
    const message = error.message || '';
    if (/bucket.*not.*found/i.test(message)) {
      throw new Error(
        'Úložiště dokumentů zatím není v Supabase založené. Spusťte migraci ' +
        'supabase/migrations/20260825100000_property_note_documents_history.sql.'
      );
    }
    throw new Error(`Nahrání dokumentu selhalo: ${message}`);
  }

  return supabase.storage.from(PROPERTY_DOCUMENT_BUCKET).getPublicUrl(key).data.publicUrl;
}

/**
 * Smaže soubor z našeho úložiště podle veřejné URL.
 *
 * Fotky stažené při importu inzerátu leží na cizím serveru — takovou URL
 * poznáme podle toho, že v ní není cesta k našemu bucketu, a mlčky ji
 * přeskočíme. Selhání mazání se nehlásí uživateli: odkaz už zmizel, osiřelý
 * soubor je náš problém, ne jeho.
 */
export async function deleteStoredFile(url: string): Promise<void> {
  for (const bucket of [PROPERTY_PHOTO_BUCKET, PROPERTY_DOCUMENT_BUCKET]) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const at = url.indexOf(marker);
    if (at === -1) continue;

    const key = decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) console.warn(`Soubor ${key} zůstal v úložišti:`, error.message);
    return;
  }
}

/**
 * Adresy téže fotky od největší po původní.
 *
 * Portály vracejí v og:image často jen náhled — RE/MAX `_th350` je 350 px,
 * Sreality servíruje z `/thumbs/` deseti­kilobajtový obrázek. Velikost se
 * odhadnout dá, ale ne spolehlivě, proto vracíme seznam: server zkusí jednu
 * po druhé a první funkční si nechá. Špatný odhad tak nikdy fotku neztratí.
 */
export function photoSizeCandidates(url: string): string[] {
  const out: string[] = [];
  try {
    const u = new URL(url);

    // Sreality: CDN Seznamu pouští jen tenhle jeden tvar transformace —
    // ověřeno, jakákoli jiná velikost vrací 400 a holá adresa 401.
    if (u.hostname.endsWith('sdn.cz') && !u.search.includes('fl=')) {
      out.push(url.split('?')[0] + '?fl=res,1200,1200,1|shr,,20|jpg,80');
    }

    // RE/MAX: _th350 je náhled, plná fotka bývá bez přípony velikosti
    if (/_th\d+\.(jpe?g|png|webp)$/i.test(u.pathname)) {
      out.push(url.replace(/_th\d+(\.[a-z]+)$/i, '_th1920$1'));
      out.push(url.replace(/_th\d+(\.[a-z]+)$/i, '$1'));
    }

    // iDNES a další: /thumbs/ je zmenšenina, /images/ bývá originál
    if (u.pathname.includes('/thumbs/')) {
      out.push(url.replace('/thumbs/', '/images/'));
    }
  } catch {
    /* neplatná adresa — vrátíme jen původní */
  }

  out.push(url);
  return [...new Set(out)];
}

/** Zrcadlí fotku z portálu do našeho úložiště přes serverovou funkci. */
export async function mirrorRemotePhoto(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('mirror-photo', {
    body: { urls: photoSizeCandidates(url) },
  });
  if (error) throw new Error(error.message || 'Fotku se nepodařilo zkopírovat.');
  if (!data?.url) throw new Error(data?.error || 'Fotku se nepodařilo zkopírovat.');

  const stored = data.url as string;
  await ensureThumb(stored).catch(() => false);
  return stored;
}

/** Leží fotka u nás, nebo pořád na cizím serveru? */
export const isStoredPhoto = isStoredPhotoUrl;

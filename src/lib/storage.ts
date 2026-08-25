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
 * Nahraje oříznutou fotku do Supabase Storage a vrátí veřejnou URL.
 * Chybu bucketu hlásíme srozumitelně — bez spuštěné migrace neexistuje.
 */
export async function uploadPropertyPhoto(blob: Blob): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

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

  const { data } = supabase.storage.from(PROPERTY_PHOTO_BUCKET).getPublicUrl(name);
  return data.publicUrl;
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

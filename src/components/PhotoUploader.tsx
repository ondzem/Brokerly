import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cropToBlob, uploadPropertyPhoto, PHOTO_ASPECT } from '@/lib/storage';
import { toast } from 'sonner';

type Rect = { x: number; y: number; width: number; height: number };
type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

/** Největší ořez v daném poměru, který se vejde do rozměrů obrázku. */
function initialCrop(naturalWidth: number, naturalHeight: number): Rect {
  let width = naturalWidth;
  let height = width / PHOTO_ASPECT;
  if (height > naturalHeight) {
    height = naturalHeight;
    width = height * PHOTO_ASPECT;
  }
  return {
    x: (naturalWidth - width) / 2,
    y: (naturalHeight - height) / 2,
    width,
    height,
  };
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<string[]>([]); // data URL fotek čekajících na ořez
  const [crop, setCrop] = useState<Rect | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [busy, setBusy] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ handle: Handle; startX: number; startY: number; startCrop: Rect } | null>(null);

  const current = queue[0] ?? null;

  const acceptFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      toast.error('Vyberte prosím obrázek (JPG, PNG nebo WebP).');
      return;
    }
    const readers = images.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`Soubor ${file.name} se nepodařilo načíst.`));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((urls) => setQueue((prev) => [...prev, ...urls]))
      .catch((err) => toast.error(err.message));
  }, []);

  // Po načtení obrázku nastav výchozí ořez na celou plochu v cílovém poměru
  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ width: img.naturalWidth, height: img.naturalHeight });
    setCrop(initialCrop(img.naturalWidth, img.naturalHeight));
  };

  // Přepočet mezi souřadnicemi obrázku a pixely na obrazovce
  const scale = () => {
    const img = imgRef.current;
    if (!img || !natural.width) return 1;
    return img.clientWidth / natural.width;
  };

  const startDrag = (handle: Handle) => (e: React.PointerEvent) => {
    if (!crop) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { handle, startX: e.clientX, startY: e.clientY, startCrop: { ...crop } };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const state = dragState.current;
      if (!state || !natural.width) return;
      const s = scale();
      const dx = (e.clientX - state.startX) / s;
      const dy = (e.clientY - state.startY) / s;
      const start = state.startCrop;
      const minSize = 80; // v pixelech originálu

      let next: Rect = { ...start };

      if (state.handle === 'move') {
        next.x = Math.min(Math.max(0, start.x + dx), natural.width - start.width);
        next.y = Math.min(Math.max(0, start.y + dy), natural.height - start.height);
      } else {
        // Změna velikosti se zámkem poměru — vodicí osa je delší tažení
        const horizontal = state.handle.includes('w') || state.handle.includes('e');
        const vertical = state.handle.includes('n') || state.handle.includes('s');
        const corner = horizontal && vertical;

        let width = start.width;
        if (corner) {
          const signX = state.handle.includes('e') ? 1 : -1;
          const signY = state.handle.includes('s') ? 1 : -1;
          width = Math.abs(dx) > Math.abs(dy * PHOTO_ASPECT)
            ? start.width + dx * signX
            : start.height + dy * signY > 0
              ? (start.height + dy * signY) * PHOTO_ASPECT
              : start.width;
        } else if (horizontal) {
          width = state.handle === 'e' ? start.width + dx : start.width - dx;
        } else {
          const height = state.handle === 's' ? start.height + dy : start.height - dy;
          width = height * PHOTO_ASPECT;
        }

        width = Math.max(minSize, width);
        let height = width / PHOTO_ASPECT;

        // ukotvení podle taženého úchytu
        let x = start.x;
        let y = start.y;
        if (state.handle.includes('w')) x = start.x + start.width - width;
        if (state.handle.includes('n')) y = start.y + start.height - height;
        if (state.handle === 'n' || state.handle === 's') x = start.x + (start.width - width) / 2;
        if (state.handle === 'w' || state.handle === 'e') y = start.y + (start.height - height) / 2;

        // udrž ořez uvnitř obrázku
        if (x < 0) { width += x; x = 0; } // x je záporné → výřez se zkrátí o přesah
        if (y < 0) { y = 0; }
        if (x + width > natural.width) width = natural.width - x;
        height = width / PHOTO_ASPECT;
        if (y + height > natural.height) {
          height = natural.height - y;
          width = height * PHOTO_ASPECT;
        }
        if (width < minSize) return;

        next = { x, y, width, height };
      }

      setCrop(next);
    };

    const onUp = () => { dragState.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [natural.width, natural.height]);

  const confirmCrop = async () => {
    const img = imgRef.current;
    if (!img || !crop) return;
    setBusy(true);
    try {
      const blob = await cropToBlob(img, crop);
      const url = await uploadPropertyPhoto(blob);
      onChange([...photos, url]);
      setQueue((prev) => prev.slice(1));
      setCrop(null);
    } catch (err: any) {
      toast.error(err.message || 'Fotku se nepodařilo uložit.');
    } finally {
      setBusy(false);
    }
  };

  const skipCurrent = () => {
    setQueue((prev) => prev.slice(1));
    setCrop(null);
  };

  const s = scale();
  const box = crop
    ? { left: crop.x * s, top: crop.y * s, width: crop.width * s, height: crop.height * s }
    : null;

  const HANDLES: { key: Handle; className: string }[] = [
    { key: 'nw', className: '-top-1.5 -left-1.5 cursor-nwse-resize' },
    { key: 'ne', className: '-top-1.5 -right-1.5 cursor-nesw-resize' },
    { key: 'sw', className: '-bottom-1.5 -left-1.5 cursor-nesw-resize' },
    { key: 'se', className: '-bottom-1.5 -right-1.5 cursor-nwse-resize' },
  ];
  const EDGES: { key: Handle; className: string }[] = [
    { key: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
    { key: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
    { key: 'w', className: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize' },
    { key: 'e', className: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize' },
  ];

  return (
    <div className="space-y-4">
      {/* Hotové fotky */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((url, i) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={`Fotka ${i + 1}`}
                className="h-24 w-full rounded-lg object-cover border border-stone-200 dark:border-stone-800"
              />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#00221F]/85 text-[10px] font-medium text-white text-center py-1 rounded-b-lg">
                  hlavní fotka
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, x) => x !== i))}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-sm cursor-pointer hover:border-rose-400"
                aria-label={`Odebrat fotku ${i + 1}`}
              >
                <X className="w-3.5 h-3.5 text-stone-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ořez právě načtené fotky */}
      {current && (
        <div className="rounded-xl border-2 border-[#0E8A5F] bg-[#0E8A5F]/[0.04] p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-[13.5px] font-semibold text-stone-900 dark:text-stone-100">
              Ořízněte fotku
            </span>
            <span className="text-[11.5px] text-stone-400">
              Táhněte za rohy nebo strany, rámečkem posunete výřez
              {queue.length > 1 && ` · zbývá ${queue.length - 1} další`}
            </span>
          </div>

          <div ref={frameRef} className="relative inline-block max-w-full select-none touch-none">
            <img
              ref={imgRef}
              src={current}
              alt="Fotka k ořezu"
              onLoad={handleImageLoad}
              draggable={false}
              className="max-h-[46vh] max-w-full rounded-lg block"
            />

            {box && (
              <>
                {/* ztmavení mimo výřez */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bg-black/50" style={{ left: 0, top: 0, right: 0, height: box.top }} />
                  <div className="absolute bg-black/50" style={{ left: 0, top: box.top + box.height, right: 0, bottom: 0 }} />
                  <div className="absolute bg-black/50" style={{ left: 0, top: box.top, width: box.left, height: box.height }} />
                  <div className="absolute bg-black/50" style={{ left: box.left + box.width, top: box.top, right: 0, height: box.height }} />
                </div>

                <div
                  onPointerDown={startDrag('move')}
                  className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.35)] cursor-move"
                  style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
                >
                  {/* třetinová mřížka */}
                  <div className="absolute inset-0 pointer-events-none opacity-60">
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/70" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/70" />
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/70" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/70" />
                  </div>

                  {HANDLES.map((h) => (
                    <div
                      key={h.key}
                      onPointerDown={startDrag(h.key)}
                      className={cn('absolute w-3.5 h-3.5 rounded-sm bg-white border border-stone-400', h.className)}
                    />
                  ))}
                  {EDGES.map((h) => (
                    <div
                      key={h.key}
                      onPointerDown={startDrag(h.key)}
                      className={cn('absolute w-3.5 h-3.5 rounded-full bg-white border border-stone-400', h.className)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" onClick={confirmCrop} disabled={busy} className="h-10 text-xs">
              <Check className="w-4 h-4" />
              {busy ? 'Ukládám…' : 'Použít výřez'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 text-xs"
              disabled={busy}
              onClick={() => setCrop(initialCrop(natural.width, natural.height))}
            >
              <RotateCcw className="w-4 h-4" />
              Celá fotka
            </Button>
            <button
              type="button"
              onClick={skipCurrent}
              disabled={busy}
              className="text-[12.5px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              Zahodit
            </button>
          </div>
        </div>
      )}

      {/* Plocha pro přetažení */}
      {!current && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-[#0E8A5F] bg-[#0E8A5F]/[0.07]'
              : 'border-stone-300 dark:border-stone-700 hover:border-[#0E8A5F] hover:bg-[#0E8A5F]/[0.03]'
          )}
        >
          <Upload className={cn('w-6 h-6 mx-auto mb-2', dragOver ? 'text-[#0E8A5F]' : 'text-stone-300')} />
          <div className="text-[13.5px] font-medium text-stone-900 dark:text-stone-100">
            Přetáhněte fotky sem
          </div>
          <div className="text-[12px] text-stone-400 mt-0.5">
            nebo klikněte a vyberte ze složky · JPG, PNG, WebP
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => { acceptFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
      )}
    </div>
  );
};

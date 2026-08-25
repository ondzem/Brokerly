import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { PhotoUploader } from '@/components/PhotoUploader';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  photos: string[];
  onChange: (photos: string[]) => void | Promise<void>;
  onClose: () => void;
  title?: string;
  /** Otevřít rovnou na přidávání — z tlačítka „Přidat" na kartě. */
  startInAdd?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Galerie fotek nemovitosti přes celou obrazovku.
 *
 * Tři stavy v jedné vrstvě, ne tři obrazovky k proklikání:
 *   mřížka  → náhledy, nálet zespoda s posunem po sloupcích
 *   detail  → jedna fotka přes celou plochu, šipkami mezi nimi
 *   přidání → PhotoUploader i s ořezem, aby nové fotky měly stejný formát
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onChange,
  onClose,
  title,
  startInAdd = false,
  theme = 'dark',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(startInAdd);

  // Galerie drží režim aplikace — ve světlém by černé plátno bilo do očí.
  const light = theme === 'light';
  const c = {
    canvas: light ? 'bg-[#FAFAF8]' : 'bg-[#08110E]',
    title: light ? 'text-[#0B1F1A]' : 'text-white',
    sub: light ? 'text-stone-500' : 'text-white/50',
    ghostBtn: light
      ? 'border-stone-250/80 text-stone-500 hover:text-stone-900 hover:border-stone-400'
      : 'border-white/20 text-white/80 hover:text-white hover:border-white/40',
    tile: light ? 'bg-stone-100' : 'bg-white/5',
    arrow: light
      ? 'bg-stone-900/5 hover:bg-stone-900/10 text-[#0B1F1A]'
      : 'bg-white/10 hover:bg-white/20 text-white',
    danger: light
      ? 'border-rose-300 text-rose-600 hover:border-rose-500'
      : 'border-rose-400/40 text-rose-300 hover:border-rose-400',
    emptyText: light ? 'text-stone-600' : 'text-white/70',
  };

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null || photos.length === 0) return i;
        return (i + delta + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  // Klávesnice: v detailu listuje, jinak zavírá. Bez toho by se z galerie
  // přes celou obrazovku nešlo dostat jinak než myší.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openIndex !== null) setOpenIndex(null);
        else if (adding) setAdding(false);
        else onClose();
      }
      if (openIndex !== null) {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, adding, onClose, step]);

  const remove = (index: number) => {
    void onChange(photos.filter((_, i) => i !== index));
    setOpenIndex(null);
  };

  /** Hlavní fotka = první v poli; používá ji karta i seznam nemovitostí. */
  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...photos];
    const [picked] = next.splice(index, 1);
    void onChange([picked, ...next]);
    setOpenIndex(0);
  };

  // Do <body>, ne dovnitř dialogu: jeho překryv má vlastní vrstvu a galerii
  // by překryl, takže by fotky vycházely zašedlé.
  return createPortal(
    <div className={cn('fixed inset-0 z-[9999] flex flex-col animate-in fade-in duration-200', c.canvas)}>
      {/* Lišta */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-4 flex-none">
        <div className="min-w-0">
          <div className={cn('text-[15px] font-semibold truncate', c.title)}>
            {title || 'Fotky nemovitosti'}
          </div>
          <div className={cn('text-[12.5px]', c.sub)}>
            {photos.length === 0
              ? 'zatím žádné fotky'
              : openIndex !== null
                ? `${openIndex + 1} z ${photos.length}`
                : `${photos.length} ${photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotek'}`}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-none">
          {!adding && openIndex === null && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[#00D991] text-[#00221F] text-[13px] font-semibold cursor-pointer hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Přidat fotky
            </button>
          )}
          <button
            onClick={() => (openIndex !== null ? setOpenIndex(null) : adding ? setAdding(false) : onClose())}
            aria-label="Zavřít"
            className={cn('w-9 h-9 rounded-[10px] border flex items-center justify-center cursor-pointer', c.ghostBtn)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Přidávání — ořez řeší PhotoUploader, formát tak zůstává jednotný */}
      {adding ? (
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-stone-900 rounded-xl p-5">
            <PhotoUploader photos={photos} onChange={(next) => void onChange(next)} />
            <button
              onClick={() => setAdding(false)}
              className="mt-4 h-9 px-4 rounded-[10px] bg-[#00D991] text-[#00221F] text-[13px] font-semibold cursor-pointer hover:opacity-90"
            >
              Hotovo
            </button>
          </div>
        </div>
      ) : openIndex !== null ? (
        /* Detail jedné fotky */
        <div className="flex-1 min-h-0 flex items-center gap-2 px-2 sm:px-6 pb-6">
          {photos.length > 1 && (
            <button
              onClick={() => step(-1)}
              aria-label="Předchozí"
              className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-none cursor-pointer', c.arrow)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col items-center justify-center gap-4">
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <img
                key={photos[openIndex]}
                src={photos[openIndex]}
                alt=""
                className="max-h-full max-w-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-none">
              <button
                onClick={() => makeCover(openIndex)}
                disabled={openIndex === 0}
                className={cn('flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border text-[12.5px] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-default', c.ghostBtn)}
              >
                <Star className="w-3.5 h-3.5" />
                {openIndex === 0 ? 'Hlavní fotka' : 'Nastavit jako hlavní'}
              </button>
              <button
                onClick={() => remove(openIndex)}
                className={cn('flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border text-[12.5px] font-medium cursor-pointer', c.danger)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Smazat
              </button>
            </div>
          </div>

          {photos.length > 1 && (
            <button
              onClick={() => step(1)}
              aria-label="Další"
              className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-none cursor-pointer', c.arrow)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        /* Mřížka */
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-10">
          {photos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <div className={cn('text-[15px] font-medium', c.emptyText)}>Zatím tu nejsou žádné fotky</div>
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[#00D991] text-[#00221F] text-[13px] font-semibold cursor-pointer hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Přidat fotky
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {photos.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setOpenIndex(i)}
                  style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                  className={cn(
                    'group relative aspect-[3/2] rounded-xl overflow-hidden cursor-zoom-in', c.tile,
                    'animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-300'
                  )}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-[#00D991] text-[#00221F] text-[10.5px] font-bold px-2 py-0.5 rounded-[5px]">
                      HLAVNÍ
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
};

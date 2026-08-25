import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, Plus, Trash2, Star, ChevronLeft, ChevronRight, GripVertical, Crop } from 'lucide-react';
import { PhotoUploader } from '@/components/PhotoUploader';
import { deleteStoredFile, mirrorRemotePhoto, isStoredPhoto } from '@/lib/storage';
import { PhotoImg } from '@/components/ui/photo-img';
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
  const [pendingCrop, setPendingCrop] = useState(false);
  const [mirroring, setMirroring] = useState<string | null>(null);
  const [recropping, setRecropping] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  const dragFrom = useRef<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  // Mřížka čekala na odpověď databáze, takže fotka skočila na nové místo
  // se zpožděním. Pořadí se drží lokálně, uložení běží na pozadí.
  const [order, setOrder] = useState<string[]>(photos);

  /**
   * Přenese fotku z portálu do našeho úložiště. Cizí odkaz zmizí, jakmile
   * portál inzerát stáhne — tohle je jediná obrana.
   */
  const mirrorOne = async (url: string) => {
    setMirroring(url);
    try {
      const mine = await mirrorRemotePhoto(url);
      apply(order.map((u) => (u === url ? mine : u)));
    } catch (e: any) {
      toast.error(e.message || 'Fotku se nepodařilo přenést.');
    } finally {
      setMirroring(null);
    }
  };

  const apply = (next: string[]) => {
    setOrder(next);
    void onChange(next);
  };

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

  useEffect(() => { setOrder(photos); }, [photos]);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null || order.length === 0) return i;
        return (i + delta + order.length) % order.length;
      });
    },
    [order.length]
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
    const removed = order[index];
    apply(order.filter((_, i) => i !== index));
    setOpenIndex(null);
    // Fotka z importu leží na cizím serveru — deleteStoredFile ji přeskočí.
    if (removed) void deleteStoredFile(removed);
  };

  /** Hlavní fotka = první v poli; používá ji karta i seznam nemovitostí. */
  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...order];
    const [picked] = next.splice(index, 1);
    apply([picked, ...next]);
    setOpenIndex(0);
  };

  // Do <body>, ne dovnitř dialogu: jeho překryv má vlastní vrstvu a galerii
  // by překryl, takže by fotky vycházely zašedlé.
  /**
   * Pořadí v poli je pořadí zobrazení; první fotka je zároveň hlavní.
   * `insertAt` je pozice mezery (0…N). Po vyjmutí fotky se indexy nad ní
   * posunou o jedna, proto se cíl přepočítává.
   */
  const movePhotoTo = (from: number, insertAt: number) => {
    if (insertAt === from || insertAt === from + 1) return;
    const next = [...order];
    const [picked] = next.splice(from, 1);
    next.splice(insertAt > from ? insertAt - 1 : insertAt, 0, picked);
    apply(next);
  };

  // Po dokončení ořezu se vrátíme do mřížky — uživatel chce vidět, co přidal,
  // ne prázdnou plochu na přetažení.
  useEffect(() => {
    if (adding && addedCount > 0 && !pendingCrop) {
      const t = setTimeout(() => { setAdding(false); setAddedCount(0); }, 400);
      return () => clearTimeout(t);
    }
  }, [adding, addedCount, pendingCrop]);

  return createPortal(
    <div className={cn('fixed inset-0 z-[9999] flex flex-col animate-in fade-in duration-200', c.canvas)}>
      {/* Lišta */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-4 flex-none">
        <div className="min-w-0">
          <div className={cn('text-[15px] font-semibold truncate', c.title)}>
            {title || 'Fotky nemovitosti'}
          </div>
          <div className={cn('text-[12.5px]', c.sub)}>
            {order.length === 0
              ? 'zatím žádné fotky'
              : openIndex !== null
                ? `${openIndex + 1} z ${order.length}`
                : `${order.length} ${order.length === 1 ? 'fotka' : order.length < 5 ? 'fotky' : 'fotek'}`}
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
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 pb-10 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto py-6 text-center">
            <div className={cn('font-display font-light text-[28px] sm:text-[34px] leading-tight', c.title)}>
              {recropping ? 'Oříznout fotku' : 'Přidat fotky'}
            </div>
            <div className={cn('text-[13.5px] mt-2 mb-7 max-w-lg mx-auto leading-relaxed', c.sub)}>
              Každou fotku ořízněte na stejný formát 3:2 — v galerii i na kartě pak
              všechny drží jednu velikost.
            </div>

            <PhotoUploader
              photos={order}
              hideExisting
              onPendingChange={setPendingCrop}
              seedUrl={recropping}
              onChange={(next) => {
                if (recropping && next.length > order.length) {
                  const fresh = next[next.length - 1];
                  apply(order.map((u) => (u === recropping ? fresh : u)));
                  void deleteStoredFile(recropping);
                  setRecropping(null);
                  setAdding(false);
                  return;
                }
                if (next.length > order.length) setAddedCount((n) => n + 1);
                apply(next);
              }}
            />

            <div className="flex items-center justify-center gap-3 mt-7 flex-wrap">
              <button
                onClick={() => { setAdding(false); setAddedCount(0); setRecropping(null); }}
                className="h-10 px-5 rounded-[10px] bg-[#00D991] text-[#00221F] text-[13.5px] font-semibold cursor-pointer hover:opacity-90"
              >
                Zpět do galerie
              </button>
              <span className={cn('text-[12.5px]', c.sub)}>
                {order.length === 0
                  ? 'zatím žádné fotky'
                  : `v galerii ${order.length} ${order.length === 1 ? 'fotka' : order.length < 5 ? 'fotky' : 'fotek'}`}
              </span>
            </div>
          </div>
        </div>
      ) : openIndex !== null ? (
        /* Detail jedné fotky */
        <div className="flex-1 min-h-0 flex items-center gap-2 px-2 sm:px-6 pb-6">
          {order.length > 1 && (
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
              <div className={cn('relative h-full aspect-[3/2] max-w-full rounded-lg overflow-hidden flex items-center justify-center', c.tile)}>
                <PhotoImg
                  key={order[openIndex]}
                  src={order[openIndex]}
                  priority
                  alt=""
                  className="max-h-full max-w-full object-contain animate-in fade-in zoom-in-95 duration-200"
                />
              </div>
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
                onClick={() => { setRecropping(order[openIndex]); setOpenIndex(null); setAdding(true); }}
                className={cn('flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border text-[12.5px] font-medium cursor-pointer', c.ghostBtn)}
              >
                <Crop className="w-3.5 h-3.5" />
                Oříznout
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

          {order.length > 1 && (
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
          {order.length === 0 ? (
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
            <>
            {order.length > 1 && (
              <div className={cn('text-[12.5px] pt-2 pb-6', c.sub)}>
                Přetažením změníte pořadí — zelená čára ukáže, kam fotka spadne · první je hlavní
              </div>
            )}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom.current !== null && dropAt !== null) movePhotoTo(dragFrom.current, dropAt);
                dragFrom.current = null;
                setDropAt(null);
              }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {order.map((url, i) => (
                <div key={url} className="relative">
                  {/* Čára v mezeře ukazuje, kam fotka spadne. */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -left-2 sm:-left-2.5 top-0 bottom-0 w-[3px] rounded-full bg-[#00D991] transition-opacity',
                      dropAt === i ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {i === order.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -right-2 sm:-right-2.5 top-0 bottom-0 w-[3px] rounded-full bg-[#00D991] transition-opacity',
                        dropAt === order.length ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  )}

                  <button
                    onClick={() => setOpenIndex(i)}
                    draggable
                    onDragStart={() => { dragFrom.current = i; }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      const r = e.currentTarget.getBoundingClientRect();
                      setDropAt(e.clientX < r.left + r.width / 2 ? i : i + 1);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const r = e.currentTarget.getBoundingClientRect();
                      const at = e.clientX < r.left + r.width / 2 ? i : i + 1;
                      if (dragFrom.current !== null) movePhotoTo(dragFrom.current, at);
                      dragFrom.current = null;
                      setDropAt(null);
                    }}
                    onDragEnd={() => { dragFrom.current = null; setDropAt(null); }}
                    style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                    className={cn(
                      'group relative w-full aspect-[3/2] rounded-xl overflow-hidden cursor-zoom-in transition-all', c.tile,
                      'animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-300',
                      dragFrom.current === i && 'opacity-35 scale-95'
                    )}
                  >
                    <PhotoImg
                      src={url}
                      thumb
                      priority={i < 6}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#00D991] text-[#00221F] text-[10.5px] font-bold px-2 py-0.5 rounded-[5px]">
                        HLAVNÍ
                      </span>
                    )}
                    {!isStoredPhoto(url) && (
                      <span
                        role="button"
                        tabIndex={0}
                        title="Fotka leží na serveru portálu. Až inzerát stáhnou, zmizí i odsud."
                        onClick={(e) => { e.stopPropagation(); void mirrorOne(url); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); void mirrorOne(url); } }}
                        className="absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-[5px] bg-amber-500 text-[#241a00] text-[10.5px] font-bold cursor-pointer hover:opacity-90"
                      >
                        {mirroring === url ? 'Přenáším…' : 'uložit k nám'}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/45 text-white items-center justify-center hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-white bg-black/45 px-1.5 rounded">
                      {i + 1}
                    </span>
                  </button>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      )}
    </div>,
    document.body
  );
};

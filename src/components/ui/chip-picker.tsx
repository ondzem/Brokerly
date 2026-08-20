import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ChipPickerProps {
  /** Klíč pole — pod ním se ukládají vlastní štítky a pořadí. */
  field: string;
  /** Vestavěné štítky. Nejdou smazat, pořadí měnit ano. */
  builtin: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

/**
 * Štítky k zaklikání s možností přidat vlastní, smazat je a přetáhnout
 * pořadí. Vlastní štítky i pořadí se ukládají do databáze, takže u další
 * nemovitosti jsou rovnou k dispozici.
 *
 * Chyba při ukládání nastavení nesmí shodit vyplňování formuláře — štítek
 * zůstane funkční pro tuhle nemovitost, jen se nezapamatuje.
 */
export const ChipPicker: React.FC<ChipPickerProps> = ({
  field,
  builtin,
  selected,
  onChange,
  label,
}) => {
  const [custom, setCustom] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const dragged = useRef<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from('custom_options')
      .select('custom, sort_order')
      .eq('field', field)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data) return;
        setCustom(data.custom || []);
        setOrder(data.sort_order || []);
      });
    return () => {
      alive = false;
    };
  }, [field]);

  const persist = (nextCustom: string[], nextOrder: string[]) => {
    setCustom(nextCustom);
    setOrder(nextOrder);
    // Dotaz se odešle až při .then() — samotné sestavení nic nespustí.
    supabase
      .from('custom_options')
      .upsert({
        field,
        custom: nextCustom,
        sort_order: nextOrder,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn('Vlastní štítky se nepodařilo uložit:', error.message);
      });
  };

  // Uložené pořadí platí jen pro štítky, které pořád existují; co v něm není
  // (nový vestavěný štítek po aktualizaci) se přidá na konec.
  const all = [...builtin, ...custom];
  const chips = [
    ...order.filter((c) => all.includes(c)),
    ...all.filter((c) => !order.includes(c)),
  ];

  const toggle = (chip: string) =>
    onChange(selected.includes(chip) ? selected.filter((c) => c !== chip) : [...selected, chip]);

  const add = () => {
    const value = draft.trim();
    setDraft('');
    setAdding(false);
    if (!value) return;
    if (!all.includes(value)) persist([...custom, value], [...chips, value]);
    if (!selected.includes(value)) onChange([...selected, value]);   // rovnou zaškrtnutý
  };

  const remove = (chip: string) => {
    persist(custom.filter((c) => c !== chip), chips.filter((c) => c !== chip));
    onChange(selected.filter((c) => c !== chip));
  };

  const drop = (target: string) => {
    const from = dragged.current;
    dragged.current = null;
    setOver(null);
    if (!from || from === target) return;
    const next = chips.filter((c) => c !== from);
    next.splice(chips.indexOf(target), 0, from);
    persist(custom, next);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-stone-700 dark:text-stone-300">{label}</span>
          <span className="text-[11px] text-stone-400">
            přetažením změníte pořadí · vlastní štítky se nabídnou i příště
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const on = selected.includes(chip);
          const mine = custom.includes(chip);
          return (
            <span
              key={chip}
              draggable
              onDragStart={() => (dragged.current = chip)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(chip);
              }}
              onDragLeave={() => setOver((o) => (o === chip ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                drop(chip);
              }}
              onDragEnd={() => {
                dragged.current = null;
                setOver(null);
              }}
              className={cn(
                'group inline-flex items-center gap-1 pl-2 pr-1 h-9 rounded-full border text-[13px] font-medium transition-colors',
                on
                  ? 'border-[#0E8A5F] bg-[#0E8A5F] text-white'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500 bg-white dark:bg-stone-950 hover:border-[#0E8A5F]/60',
                over === chip && 'ring-2 ring-[#0E8A5F]/40'
              )}
            >
              <GripVertical
                className={cn(
                  'w-3 h-3 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60',
                  on && 'text-white'
                )}
              />
              <button type="button" onClick={() => toggle(chip)} className="cursor-pointer px-0.5">
                {chip}
              </button>
              <button
                type="button"
                onClick={() => remove(chip)}
                aria-label={`Odebrat štítek ${chip}`}
                className={cn(
                  'w-5 h-5 rounded-full shrink-0 flex items-center justify-center cursor-pointer',
                  mine ? 'opacity-40 hover:opacity-100' : 'invisible pointer-events-none'
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
              if (e.key === 'Escape') {
                setDraft('');
                setAdding(false);
              }
            }}
            placeholder="např. wellness"
            className="h-9 px-3 rounded-full border border-[#0E8A5F] bg-white dark:bg-stone-950 text-[13px] outline-none w-40"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 px-3 h-9 rounded-full border border-dashed border-stone-300 dark:border-stone-700 text-[13px] font-medium text-stone-400 hover:border-[#0E8A5F] hover:text-[#0E8A5F] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            přidat vlastní
          </button>
        )}
      </div>
    </div>
  );
};

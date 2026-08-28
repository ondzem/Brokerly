// Pět pojmenovaných bodů procesu zájemce. Fáze obchodu se do nich skládají
// tak, aby KAŽDÝ posun fáze byl vidět: dvě fáze sdílející jeden bod se liší
// polovinou dílku na liště (`bar`); `step` je celý bod pro popisek „2/5".
// Jeden zdroj pro nemovitosti, kontakty i cokoli dalšího, co zájemce popisuje.
export const stageInfo = (stage: string) => {
  switch (stage) {
    case 'kontaktován':
      return { key: 'nový', step: 1, bar: 1, label: 'Nový zájemce', chip: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' };
    case 'kvalifikován':
      return { key: 'ověřený', step: 2, bar: 2, label: 'Ověřený', chip: 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900' };
    case 'prohlídka':
      return { key: 'po prohlídce', step: 3, bar: 2.5, label: 'Po prohlídce', chip: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900' };
    case 'nabídka':
      return { key: 'po prohlídce', step: 3, bar: 3, label: 'Po prohlídce', chip: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900' };
    case 'rezervace':
      return { key: 'rezervace', step: 4, bar: 4, label: 'Rezervace', chip: 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900' };
    case 'podpis':
      return { key: 'kupuje', step: 5, bar: 5, label: 'Kupuje', chip: 'bg-[#DCF5E7] text-[#0B5C3D] border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' };
    case 'prohráno':
      return { key: 'prohráno', step: 0, bar: 0, label: 'Odpadl', chip: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900' };
    default: // lead
      return { key: 'nový', step: 1, bar: 0.5, label: 'Nový zájemce', chip: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' };
  }
};

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** Sentinel — nikdy se neuloží, jen přepne pole na volný text. */
const CUSTOM = '__vlastni__';

interface OptionSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}

/**
 * Výběr z nabídky s únikovou cestou: poslední položka přepne pole na volný
 * text, aby se atypická nemovitost nemusela cpát do škatulky. Uložená hodnota
 * je vždycky prostý řetězec — v DB se nabídka od vlastního textu nerozlišuje.
 */
export const OptionSelect: React.FC<OptionSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Vyberte',
  className,
}) => {
  // Hodnota mimo nabídku (z importu nebo z dřívějška) musí pole rovnou
  // otevřít jako text, jinak by se tvářilo prázdné a při uložení se ztratila.
  const outsideOptions = Boolean(value) && !options.includes(value);
  const [typing, setTyping] = useState(outsideOptions);

  useEffect(() => {
    if (outsideOptions) setTyping(true);
  }, [outsideOptions]);

  if (typing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Napište vlastní"
          className={cn('h-10 text-xs', className)}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            onChange('');
            setTyping(false);
          }}
          aria-label="Zpět na výběr z nabídky"
          title="Zpět na výběr z nabídky"
          className="h-10 w-9 shrink-0 rounded-md border border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-pointer hover:border-stone-400 dark:hover:border-stone-500"
        >
          <X className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === CUSTOM) {
          onChange('');
          setTyping(true);
          return;
        }
        onChange(v);
      }}
    >
      <SelectTrigger id={id} className={cn('h-10 text-xs', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
        <SelectItem value={CUSTOM} className="text-[#0E8A5F]">
          jiné — napíšu vlastní…
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

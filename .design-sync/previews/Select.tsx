import { Label, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from 'brokerly';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 6, width: 240 }}>
    <Label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.55 }}>
      {label}
    </Label>
    {children}
  </div>
);

/**
 * A chosen value beside the placeholder state. The stored value IS the label —
 * that is how the app does it, so nothing has to map codes back to Czech text.
 */
export const Default = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Field label="Druh">
      <Select defaultValue="Byt">
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Byt">Byt</SelectItem>
          <SelectItem value="Dům">Dům</SelectItem>
          <SelectItem value="Pozemek">Pozemek</SelectItem>
          <SelectItem value="Komerční">Komerční</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Transakce">
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Vyberte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Prodej">Prodej</SelectItem>
          <SelectItem value="Pronájem">Pronájem</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  </div>
);

/** `size="sm"` (28px) beside the 32px default. */
export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
    <Field label="Dispozice — sm">
      <Select defaultValue="3+kk">
        <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2+kk">2+kk</SelectItem>
          <SelectItem value="3+kk">3+kk</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Dispozice — default">
      <Select defaultValue="3+kk">
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2+kk">2+kk</SelectItem>
          <SelectItem value="3+kk">3+kk</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  </div>
);

/** Disabled, and the destructive ring from `aria-invalid`. */
export const States = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Field label="Stav nabídky">
      <Select defaultValue="V nabídce">
        <SelectTrigger aria-invalid className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="V nabídce">V nabídce</SelectItem></SelectContent>
      </Select>
    </Field>
    <Field label="Přiřazený makléř">
      <Select disabled>
        <SelectTrigger className="w-full"><SelectValue placeholder="Jen pro kanceláře" /></SelectTrigger>
        <SelectContent><SelectItem value="—">—</SelectItem></SelectContent>
      </Select>
    </Field>
  </div>
);

/** The open popup: a long list sectioned with `SelectGroup` + `SelectLabel` + `SelectSeparator`. */
export const Grouped = () => (
  <div style={{ minHeight: 260 }}>
    <Field label="Odkud přišel">
      <Select defaultValue="Sreality" defaultOpen>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Portály</SelectLabel>
            <SelectItem value="Sreality">Sreality</SelectItem>
            <SelectItem value="iDNES">iDNES</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vlastní</SelectLabel>
            <SelectItem value="Web">Web</SelectItem>
            <SelectItem value="Doporučení">Doporučení</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  </div>
);

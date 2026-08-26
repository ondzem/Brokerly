import { Input, Label } from 'brokerly';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
    <Label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.55 }}>
      {label}
    </Label>
    {children}
  </div>
);

/** The label-above-value stack — the layout pattern this system is built on. */
export const Default = () => (
  <Field label="Adresa">
    <Input defaultValue="Bory 1284/12, Plzeň" />
  </Field>
);

/** Empty state: placeholder text drops to the muted foreground token. */
export const Placeholder = () => (
  <Field label="ID inzerátu">
    <Input placeholder="např. 3820174748" />
  </Field>
);

/** Numeric and email types keep the same 32px height as `Button`. */
export const Types = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    <Field label="Cena">
      <Input type="number" defaultValue={5490000} />
    </Field>
    <Field label="E-mail">
      <Input type="email" defaultValue="petr.novak@email.cz" />
    </Field>
  </div>
);

/** Invalid and disabled — `aria-invalid` paints the destructive ring. */
export const States = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    <Field label="Telefon">
      <Input aria-invalid defaultValue="60712" />
    </Field>
    <Field label="Přiřazený makléř">
      <Input disabled defaultValue="—" />
    </Field>
  </div>
);

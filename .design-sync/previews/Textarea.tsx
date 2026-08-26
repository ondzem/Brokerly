import { Label, Textarea } from 'brokerly';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 380 }}>
    <Label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.55 }}>
      {label}
    </Label>
    {children}
  </div>
);

/** Grows with its content (`field-sizing-content`), minimum four rows. */
export const Default = () => (
  <Field label="Co je v ceně / fakta pro odpovědi">
    <Textarea defaultValue={'V ceně kuchyňská linka, vestavěné skříně a sklep 4 m².\nPřevod do osobního vlastnictví hotový.\nMožné předání od června.'} />
  </Field>
);

/** Empty state. */
export const Placeholder = () => (
  <Field label="Poznámka">
    <Textarea placeholder="Cokoli, co si o téhle nemovitosti potřebujete pamatovat…" />
  </Field>
);

/** Invalid and disabled. */
export const States = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    <Field label="Pravidlo eskalace">
      <Textarea aria-invalid defaultValue="" placeholder="Povinné pole" />
    </Field>
    <Field label="Interní poznámka kanceláře">
      <Textarea disabled defaultValue="Dostupné až ve verzi pro kanceláře." />
    </Field>
  </div>
);

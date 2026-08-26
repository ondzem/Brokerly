import { Input, Label } from 'brokerly';

/** The house micro-label: 11px, semibold, uppercase, wide tracking, muted. */
export const MicroLabel = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 300 }}>
    <Label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.55 }}>
      Užitná plocha
    </Label>
    <Input defaultValue="68 m²" />
  </div>
);

/** The component's own default styling — 14px, medium weight. */
export const Default = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 300 }}>
    <Label htmlFor="owner">Vlastník</Label>
    <Input id="owner" defaultValue="Petr Novák" />
  </div>
);

/** Labels are flex rows with a 8px gap — a trailing hint sits inline. */
export const WithHint = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 300 }}>
    <Label htmlFor="penb">
      PENB
      <span style={{ fontWeight: 400, opacity: 0.5 }}>nepovinné</span>
    </Label>
    <Input id="penb" placeholder="A–G" />
  </div>
);

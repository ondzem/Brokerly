import { Button } from 'brokerly';

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** The six variants. `default` is the accent green — one per screen, never two. */
export const Variants = () => (
  <Row>
    <Button>Uložit nemovitost</Button>
    <Button variant="secondary">Zpět</Button>
    <Button variant="outline">Filtry</Button>
    <Button variant="ghost">Zrušit</Button>
    <Button variant="destructive">Smazat</Button>
    <Button variant="link">Zobrazit inzerát</Button>
  </Row>
);

/** The size scale: 24 / 28 / 32 / 36px. Shown in `outline` so the accent stays scarce. */
export const Sizes = () => (
  <Row>
    <Button size="xs" variant="outline">xs · 24px</Button>
    <Button size="sm" variant="outline">sm · 28px</Button>
    <Button size="default" variant="outline">default · 32px</Button>
    <Button size="lg" variant="outline">lg · 36px</Button>
  </Row>
);

/** Icon-only buttons for toolbars — square, same four steps. */
export const IconOnly = () => (
  <Row>
    <Button size="icon-xs" variant="ghost" aria-label="Přidat"><Plus /></Button>
    <Button size="icon-sm" variant="outline" aria-label="Přidat"><Plus /></Button>
    <Button size="icon" variant="secondary" aria-label="Přidat"><Plus /></Button>
    <Button size="icon-lg" aria-label="Přidat"><Plus /></Button>
  </Row>
);

/** A leading icon inside a labelled button. */
export const WithIcon = () => (
  <Row>
    <Button><Plus />Nová nemovitost</Button>
    <Button variant="outline"><Plus />Přidat fotky</Button>
  </Row>
);

/** Disabled drops to 50% opacity and stops pointer events. */
export const Disabled = () => (
  <Row>
    <Button disabled>Uložit</Button>
    <Button variant="outline" disabled>Filtry</Button>
    <Button variant="destructive" disabled>Smazat</Button>
  </Row>
);

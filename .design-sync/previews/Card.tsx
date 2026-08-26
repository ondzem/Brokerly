import { Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'brokerly';

/** The canonical card: header, body, footer. The footer gets its own muted band. */
export const Default = () => (
  <div style={{ maxWidth: 380 }}>
    <Card>
      <CardHeader>
        <CardTitle>Bory 3+kk</CardTitle>
        <CardDescription>Plzeň — Bory · 68 m² · osobní vlastnictví</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost">Upravit</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'grid', gap: 10 }}>
          <Field label="Cena" value="5 490 000 Kč" />
          <Field label="Stav nabídky" value="V nabídce" />
          <Field label="Vlastník" value="Petr Novák" />
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm">Otevřít kartu</Button>
      </CardFooter>
    </Card>
  </div>
);

/** `size="sm"` tightens the internal spacing for dense lists. */
export const Small = () => (
  <div style={{ maxWidth: 380 }}>
    <Card size="sm">
      <CardHeader>
        <CardTitle>Veselá — Bory 3+kk</CardTitle>
        <CardDescription>Fáze: prohlídka · horký</CardDescription>
      </CardHeader>
      <CardContent>
        <Field label="Další krok" value="Zavolat ohledně financování" />
      </CardContent>
    </Card>
  </div>
);

/** Header only — the shape used for a summary tile. */
export const HeaderOnly = () => (
  <div style={{ maxWidth: 380 }}>
    <Card>
      <CardHeader>
        <CardTitle>Dnešní připomínky</CardTitle>
        <CardDescription>4 nevyřízené</CardDescription>
      </CardHeader>
    </Card>
  </div>
);

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

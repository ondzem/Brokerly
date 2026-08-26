## Building with Brokerly

Brokerly is the CRM a Czech solo real-estate agent runs their day from. The look
is **editorial premium minimal**: generous whitespace, a strong typographic
hierarchy, hairline borders, and exactly one restrained accent. It should read
like a high-end editorial brand with the clarity of Linear — never like a loud
generic SaaS. **The product UI is in Czech**; write Czech copy in designs.

### Setup

No provider, no theme object, no wrapper. Import a component and render it.
Everything is driven by CSS custom properties defined on `:root` in the
stylesheet, so the only requirement is that `styles.css` is loaded.

**Dark mode** is a `.dark` class on an ancestor (usually `<html>`), which swaps
the same custom properties. It is not a prop and not a context. To design a dark
screen, put the whole thing inside `<div className="dark bg-background">`.

### The styling idiom

Tailwind v4 utility classes, where the colour utilities resolve to design tokens
rather than fixed palette values. **Always reach for the token utility, never a
raw Tailwind colour** — `bg-card` is right, `bg-white` and `bg-slate-50` are
wrong, and they break dark mode.

| Surfaces | see **Layering** below — `bg-panel` / `bg-chrome` / `bg-surface` / `bg-inset` |
| Text | `text-foreground` · `text-card-foreground` · `text-muted-foreground` (secondary) · `text-primary` (accent) · `text-destructive` |
| Accent | `bg-primary` + `text-primary-foreground` — the green. One primary action per screen. |
| Lines | `border-border` · `border-input` (form controls) · `ring-foreground/10` (the card hairline) |
| Focus | handled inside every control (a 3px `--ring` halo) — don't write focus classes |
| Radius | `rounded-lg` on controls, `rounded-xl` on cards, `rounded-full` on chips |
| Type | `font-sans` = Inter (default) · `font-heading` / `font-display` = Hanken Grotesk · `font-mono` = Geist Mono |

### Layering — the most important rule here

Nothing in this system separates by shadow, and hairlines alone are not enough:
a white card on a white page reads as one flat sheet. Content is separated by
**shade**, on a four-step scale. Pick the step by how far a thing sits from the
reader, and the theme resolves it:

| Class | Role | Light | Dark |
|---|---|---|---|
| `bg-panel` | recessed — the ground content sits ON (page body, dialog body) | `#F2F1EC` | stone-900 |
| `bg-chrome` | the sticky frame — headers, tab bars, footers | white | stone-900 |
| `bg-surface` | the content itself — cards, panels, raised controls | white | stone-950 |
| `bg-inset` | a block nested *inside* a card — empty states, sub-panels | `#F8F7F3` | stone-900 |

Light and dark move in opposite directions (light raises by getting lighter,
dark by getting darker) — that is why you use the names, never the raw values.
Pair them with `border-hairline`.

**A screen must never be one flat tone.** The reliable shape is
`bg-panel` body → `bg-surface` cards → `bg-inset` for anything nested inside a
card. Steps are deliberately small: the point is that the eye groups things, not
that it notices the colour.

Two more rules that carry the character and are easy to get backwards:

1. **Big things are light, small things are bold.** Page headings and large
   numbers are `font-light` (300) with `tracking-tight`; small labels are
   `font-semibold` (600). This inversion is where the editorial feel comes from.
2. **The micro-label.** `text-[11px] font-semibold uppercase tracking-wider
   text-muted-foreground`, sitting **above** its value, never beside it. This
   label/value stack is the system's primary hierarchy device — use it for every
   field, spec and metadata pair.

Depth comes from hairlines and whitespace, not shadows. `shadow-sm` on a card is
the ceiling. No gradients. Spacing runs on a 4px rhythm: `gap-2` inside a group,
`gap-4` between groups. Transitions are `duration-150`.

Controls share heights so rows line up: `Button` and `Input` are 32px by
default, `Select`'s trigger too. The app itself commonly overrides a form row to
40px with `className="h-10"` — whichever you choose, make every control in that
row match.

### Where the truth is

Read `_ds/<folder>/styles.css` (and its `@import`s) for the full token list, and
each component's `.prompt.md` for its real props and composition rules. Those
files beat this summary.

### An idiomatic block

```jsx
<Card>
  <CardHeader>
    <CardTitle>Bory 3+kk</CardTitle>
    <CardDescription>Plzeň — Bory · 68 m²</CardDescription>
    <CardAction><Button size="sm" variant="ghost">Upravit</Button></CardAction>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cena
        </div>
        <div className="text-[14.5px] font-semibold">5 490 000 Kč</div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Stav nabídky
        </Label>
        <Select defaultValue="v-nabidce">
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="v-nabidce">V nabídce</SelectItem>
            <SelectItem value="rezervovano">Rezervováno</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
  <CardFooter><Button size="sm">Otevřít kartu</Button></CardFooter>
</Card>
```

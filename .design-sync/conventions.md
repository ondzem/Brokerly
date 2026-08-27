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

**Design for light.** The product runs light-only — the dark-mode toggle was
retired. A `.dark` class still swaps the same custom properties if it is put on
an ancestor, but nothing in the app sets it, so treat dark as dormant rather
than as a mode to design for.

### The styling idiom

Tailwind v4 utility classes, where the colour utilities resolve to design tokens
rather than fixed palette values. **Always reach for the token utility, never a
raw Tailwind colour** — `bg-card` is right, `bg-white` and `bg-slate-50` are
wrong, and they break dark mode.

| Surfaces | see **Layering** below — `bg-panel` / `bg-surface` / `bg-inset` |
| Text | `text-foreground` · `text-card-foreground` · `text-muted-foreground` (secondary) · `text-primary` (accent) · `text-destructive` |
| Accent | `bg-primary` + `text-primary-foreground` — the green. One primary action per screen. |
| Lines | `border-hairline` — the one weight (see **Layering**) · `border-input` on form controls |
| Focus | handled inside every control (a 3px `--ring` halo) — don't write focus classes |
| Radius | `rounded-lg` on controls, `rounded-xl` on cards, `rounded-full` on chips |
| Type | `font-sans` = Inter (default) · `font-heading` / `font-display` = Hanken Grotesk · `font-mono` = Geist Mono |

### Layering — the most important rule here

Nothing here separates by shadow, and barely by fill. Content separates by a
**hairline and a gap**. There are two levels and a hole:

| Class | Role | Light |
|---|---|---|
| `bg-panel` | the ground — page/dialog body **and its sticky header, tab bar and footer** | `#FDFDFB` |
| `bg-surface` | anything raised off it — cards, menus, floating controls, inputs | `#FFFFFF` |
| `bg-inset` | a block cut into a card — empty states, upload prompts | `#EFF6F1` |

**One line weight for everything**: `border-hairline`
(`rgba(11,31,26,.06)`). The outline that closes a card and the divider under a
tab bar are the same stroke. Do not introduce a heavier one.

Three rules:

1. **The fill difference is under 1 L\* and separates nothing on its own.**
   Panel and surface are all but the same white; the hairline and the space
   around a block do the work. Widening the fill gap reads as banding — it was
   tried twice and rejected both times.
2. **A band is not a third tone.** A sticky header or footer takes `bg-panel`
   like the body it belongs to, divided by a hairline only.
3. **A border may go heavier only when it carries state.** Route tiles,
   selectable rows and hover/selection affordances use the accent; plain
   containment never does.

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

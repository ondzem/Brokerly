---
category: Actions
---
# Button

The single action control, built on `@base-ui/react/button`.

**Variants** — `default` (accent green), `secondary`, `outline`, `ghost`,
`destructive`, `link`. Use `default` sparingly: one per screen. Two accent-green
buttons on one view means one of them is wrong. `destructive` is a tinted
background with destructive-coloured text, not a solid red fill.

**Sizes** — `xs` (24px), `sm` (28px), `default` (32px), `lg` (36px), plus the
square `icon-xs` / `icon-sm` / `icon` / `icon-lg`. Pass `className="h-10"` when
a button has to line up with a 40px form row; unequal heights in a control row
are the most visible mistake in this system.

Radius is `rounded-lg`; focus paints a 3px ring in the accent. An `svg` child is
auto-sized to 16px (12–14px at the smaller sizes).

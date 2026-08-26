---
category: Forms
---
# Input

Single-line field, 32px tall (`h-8`) — the same height as a default `Button`.
Form rows in the app usually override to `className="h-10"`; whichever you pick,
every control in that row must match.

Put `Label` **above** the input, not beside it. The label/value stack is the core
layout pattern of this system.

`aria-invalid` paints the destructive border and ring; `disabled` fills with
`bg-input/50` at half opacity. Placeholder text uses the muted foreground token.

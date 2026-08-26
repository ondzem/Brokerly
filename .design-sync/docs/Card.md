---
category: Layout
---
# Card

The content surface: `bg-card`, `rounded-xl`, and a **hairline `ring-1
ring-foreground/10`** — not a border and not a drop shadow. Depth in this system
comes from that hairline plus surrounding whitespace; reach for a heavier shadow
and it stops looking like Brokerly.

Internal spacing is driven by the `--card-spacing` custom property, switched by
`size`: `default` (16px) or `sm` (12px). Children read it, so padding stays
consistent without per-element classes.

Compose with `CardHeader` + `CardTitle` + `CardDescription`, `CardContent`,
`CardAction` (a control pinned top-right of the header) and `CardFooter` (which
gets its own `bg-muted/50` band and a top border). A first- or last-child `img`
is corner-clipped automatically, so a photo can sit flush at the top.

`CardTitle` is the one place the display face (`font-heading`, Hanken Grotesk)
appears at component level.

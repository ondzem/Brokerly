---
category: Forms
---
# Select

Dropdown chooser built on `@base-ui/react/select`. `SelectTrigger` is 32px
(`size="default"`) or 28px (`size="sm"`), matching `Input` and `Button`; it is
`w-fit` by default, so pass `className="w-full"` for a form field.

Compose `SelectTrigger` + `SelectValue` with a `SelectContent` holding
`SelectItem`s. Section a long list with `SelectGroup` + `SelectLabel`, divided by
`SelectSeparator`. The popup renders through a portal and mirrors the trigger's
width.

`SelectValue` takes `placeholder` for the empty state, which paints in the muted
foreground token.

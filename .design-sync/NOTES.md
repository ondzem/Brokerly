# design-sync — repo notes

## What this repo is, for sync purposes

Brokerly is a Vite **application**, not a published component library. There is
no `dist/` library entry and no shipped `.d.ts`, so the sync needs three things
that a normal DS package gives for free:

- **`.design-sync/entry.ts`** is the library surface — a hand-written barrel over
  `src/components/ui/*`. Pass it as `--entry`; without it the converter looks for
  `node_modules/brokerly/package.json` and dies with `ENOENT` (it never
  self-installs). Adding a component to the sync means adding an `export *` line
  here, not just a `componentSrcMap` entry.
- **Views are deliberately excluded.** `PropertiesView`, `DashboardView`,
  `KanbanView` etc. are whole screens (PropertiesView is ~6 000 lines), not
  reusable parts. They must never enter `entry.ts`.
- **`exported PascalCase symbols: 0`** in the build log is expected, not a bug —
  there is no `.d.ts` tree to scan. Props come from the `src/` scan instead
  (`[DTS] 6/6 components`), and `componentSrcMap` is therefore the authoritative
  component list: a component absent from it gets no card.

## CSS: Tailwind v4 must be compiled first

`src/index.css` is a Tailwind **source** file (`@import "tailwindcss"`), useless
as `cssEntry`. `cfg.buildCmd` runs `vite build` and concatenates
`.design-sync/fonts.css` + the emitted `dist/assets/index-*.css` into
`.design-sync/.cache/tailwind.css`, which is what `cssEntry` points at.

- The Vite output filename is content-hashed, hence the glob in `buildCmd`.
- **The compiled CSS only contains utilities the app actually uses.** A preview
  that reaches for a Tailwind class no screen uses will render unstyled. Compose
  previews from the components' own classes (or inline styles) and this stays a
  non-issue.
- `cfg.tokensGlob` cannot help here: `copyTokens` resolves it under
  `node_modules/<tokensPkg>`, not the repo. That is why the Google Fonts
  `@import` is concatenated into `cssEntry` instead of shipped as a token file.

## Fonts

Inter / Hanken Grotesk / Geist Mono are served by Google Fonts at runtime (a
`<link>` in `index.html`). `.design-sync/fonts.css` re-declares that as a CSS
`@import` so the bundle carries it; validate then reports `[FONT_REMOTE]`, which
is correct and expected. Do **not** try to satisfy this with `extraFonts` — there
are no local font files in the repo.

## Groups

There is no docs tree in the repo, so `cfg.docsDir` points at
`.design-sync/docs/`, six short hand-written `.md` files whose `category:`
frontmatter sets the DS-pane group (Actions / Forms / Layout). They are also the
component's `.prompt.md` — the design agent's usage reference. Keep them true:
they claim specific pixel heights and class names.

## Known render warns

- `[FONT_REMOTE]` on Inter / Geist Mono / Hanken Grotesk — expected, see Fonts.
- `tokens: 1 missing` — below threshold, a `var(--*)` referenced by a Tailwind
  utility no shipped rule defines. Not worth chasing.

## Presentation

All six components use `cfg.overrides.<Name>.cardMode = "column"`. Their stories
are wide rows (a variant sweep, a label+field stack); in the default grid the
right-hand exports were clipped. Column gives each export the full card width.

## Surface scale

`src/index.css` defines `--panel` / `--surface` / `--inset` / `--hairline`,
exposed to Tailwind as `bg-panel`, `bg-surface`, `bg-inset`, `border-hairline`.
Two facts that are easy to undo by accident:

- **The light step is ~3 L\* and is deliberately that small.** A first pass used
  the page canvas `#F2F1EC` for `--panel`; it read as a hard band and was
  rejected. `#F6F5F1` is the tuned value.
- **There is no separate token for sticky bands.** An earlier `--chrome` token
  made headers and footers white over a grey body, which striped the dialog.
  Bands take `bg-panel` like the body they belong to; a hairline divides them.
  Do not reintroduce a third tone.

The properties **list page** deliberately does NOT use this scale — it keeps its
own `colors` object (canvas `#F2F1EC`, white cards) because its dark values
(`#00221F`, `#072C27`) differ from the stone-based ones the dialogs use. Same
for `DashboardView`. Converting them needs its own pass, not a find-and-replace.

## Re-sync risks

- **`cssEntry` is a build artefact.** If someone runs the converter without
  running `cfg.buildCmd` first, it ships whatever stale CSS is in
  `.design-sync/.cache/` — or fails outright on a fresh clone, where the file
  doesn't exist. Always run `buildCmd` first.
- **Tailwind's used-class set moves with the app.** Deleting a screen can remove
  utilities a preview depends on. If a card suddenly renders unstyled after an
  unrelated app change, this is the cause.
- **Only 6 of the 15 components in `src/components/ui/` are synced** — the user
  scoped this first run to "tokens and the basics". The bundle's `entry.ts`
  already exports Tabs, Dialog, Popover, DropdownMenu and Calendar, so adding
  their cards is a `componentSrcMap` + `.design-sync/docs/<Name>.md` +
  `previews/<Name>.tsx` job, no bundle work. `chip-picker`, `option-select`,
  `photo-img` and `sonner` are **not** in `entry.ts` yet.
- Dialog / Popover / DropdownMenu are portal-rendered overlays. When their cards
  get authored they will likely need
  `cfg.overrides.<Name> = {"cardMode": "single", "viewport": "WxH"}`.
- The app has a full **dark theme** (`.dark` class, a green-not-grey palette).
  The preview cards only ever render the light theme. A dark-mode card would need
  a wrapper that sets `class="dark"`.

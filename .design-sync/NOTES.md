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
exposed as `bg-panel`, `bg-surface`, `bg-inset`, `border-hairline`.

Four passes of tuning, all driven by the same complaint getting narrower:

1. `--panel` = the page canvas `#F2F1EC`. A ~5 L\* step read as a slab, and
   white sticky bands over it striped the dialog into three tones.
2. `#F6F5F1`, bands folded into the panel. Better, still a visible step.
3. `#FCFCF9` with `--hairline` raised to `.14` so the line took over the
   dividing. Removing the card outline entirely was tried here and reverted in
   the same pass — on a near-white ground a borderless white card is invisible.
4. `#FDFDFB` with ONE line weight at `.06`. The fill now separates nothing; the
   hairline and the gap do all of it. Then `#FCFDFA` — `#FDFDFB` read as too
   light, so the value sits at the midpoint of the two rejected ends.

The whole usable range turned out to be about half an L\* unit wide
(contrast-vs-white 1.028 → 1.018). Anything outside it has been rejected in both
directions, so the fill is a spent lever: if the separation reads wrong again,
change the hairline or the spacing, not this.

Do not reintroduce a second line weight or widen the fill step — both were tried
and rejected. `--hairline-soft` existed briefly in pass 3 and is gone.

The properties **list page** deliberately does NOT use this scale — it keeps its
own `colors` object (canvas `#F2F1EC`, white cards). Same for `DashboardView`.
Converting them needs its own pass, not a find-and-replace.

**The app is light-only** since `f0340b3` retired the toggle. The `.dark` block
and ~338 `dark:` classes are still in the source, dormant.

## Two bugs found while checking this, worth remembering

**The accent focus ring read as a green frame.** `@layer base { * { …
outline-ring/50 } }` paints focus in `--ring` (`#00D991`). Base UI's dialog
autofocused the first control inside — the property photo — so opening a card
drew a bright green outline around the photo. Fixed in
`src/components/ui/dialog.tsx`: the popup takes `tabIndex={-1}` and
`initialFocus={popupRef}`, so focus parks on the dialog itself. The focus trap
still works and keyboard users still get rings on real controls.

**The app shell overflowed horizontally at md.** `App.tsx`'s content column is a
flex item with `md:pl-24`; without `min-w-0` its `min-width: auto` floor kept it
at content width, so the page scrolled sideways by exactly the padding (863 on a
768 viewport). Fixed with `min-w-0`. Note the sidebar is `w-16` (64px) while the
padding is `pl-24` (96px) — the 32px gap is left as-is, it looks deliberate.

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

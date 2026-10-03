# Úklid repozitáře — inventura (3. 10. 2026)

## Provedeno 3. 10.

**Smazáno**
- `postcss.config.mjs` + devDependency `@tailwindcss/postcss` (lock přegenerován) — Tailwind už neběží dvakrát; CSS buildu 117,85 → 108,88 kB.
- `src/components/ui/dropdown-menu.tsx`, `src/components/ui/tabs.tsx` — zbývá 13 ui komponent.
- `public/Black Logo - Brokerly.png.webp`.
- `.mcp.json` (21st.dev MCP se nepoužíval).
- `.design-sync/` (20 souborů) — synchronizace do Claude Designu zrušena; `NOTES.md` a `conventions.md` přesunuty do `docs/projekt/04-design/historie/design-sync-*.md`. Z `vite.config.ts` a `.gitignore` odstraněny odkazy na ni (`.ds-sync/` a `ds-bundle/` zůstávají v `.gitignore` — jsou jen lokální, smazat ručně).
- `docs/design-system.md` → `docs/projekt/04-design/design-system.md`.

**Opraveno**
- `eslint.config.mjs` — flat config pro Vite + React + TS (`@eslint/js@9`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`). `npm run lint` se spouští; hlásí **120 problémů (118 chyb, 2 varování)** v existujícím kódu, nic neopraveno: `no-unused-vars` 66, `no-explicit-any` 37, `react-hooks/set-state-in-effect` 10, `react-hooks/refs` 3, `no-useless-escape` 2 — v `App.tsx`, `ContactsView`, `DashboardView`, `KanbanView`, `PhotoGallery`, `PhotoUploader`, `PropertiesView`, `RemindersView`, `lib/*`.
- `components.json` — `css: src/index.css`, `rsc: false`, `tailwind.config: ""`.
- `.claude/settings.json` — hooky graphify jako `command -v graphify >/dev/null 2>&1 && graphify … || true` (fungují na každém stroji, chování zachováno).
- Dokumenty: odkazy opraveny v `00-mapa.md`, `04-design.md` (sync označen „zrušeno 3. 10. 2026"), `design-system.md`, `05-nastroje-a-technika.md`, `07-otevrene-otazky.md`, `03-stav-aplikace.md` §7–8 (vyřešené položky přeškrtnuté), `historie/2026-09-25-redesign-plan.md`.

**Ověřeno**: `npm run build` exit 0 · `npx tsc --noEmit` exit 0 · `npm run lint` se spustí (exit 1 kvůli 118 chybám v kódu) · grep na smazané cesty najde už jen historické zmínky v dokumentech.

Oddíl B (kód stránek) a zbytek C (tmavý režim, `NEXT_PUBLIC_` prefix, `docx`) beze změny.

---

> Jen seznam s důkazy. Nic nebylo smazáno, žádný kód nebyl pushnut. Zkouška z kroku 5 proběhla v pracovní kopii a byla vrácena `git checkout .`.
>
> Postup: `git ls-files` (139 souborů) → kategorie · `npx knip` + `npx depcheck` · ruční grep (importy, dynamické `import(`, HTML/CSS/config, package.json scripts, `.claude/`, hooky, `start.sh`, `supabase/config.toml`, odkazy z docs/AGENTS/README) · každý kandidát „nepoužívá se" prověřen samostatným agentem (Sonnet), který hledal opak · zkouška buildu bez kandidátů A.
>
> Pravidla dodržena: tmavý režim zůstává (3. 10.), migrace nikdy, `.env*` a databáze nedotčeny.

---

## 1. Úplnost — každý tracked soubor zařazen

| Položka | Kategorie | Počet | Poznámka |
|---|---|---|---|
| `src/App.tsx`, `main.tsx`, `index.css` | kód | 3 | vstup aplikace |
| `src/components/*.tsx` (8 pohledů/komponent) | kód | 8 | všech 8 importuje `App.tsx` nebo `PropertiesView.tsx` |
| `src/components/property-detail/*` | kód | 2 | `PropertyDetailLayout.tsx` + `property-detail.css` (import `PropertyDetailLayout.tsx:2`) |
| `src/components/ui/*.tsx` | kód | 15 | 13 importovaných; **`dropdown-menu.tsx`, `tabs.tsx` nikde v src** (knip + grep) |
| `src/lib/*.ts` | kód | 7 | všech 7 importováno (`db` 6×, `storage` 4×, `supabase` 4×, `utils` 16×, `stage` 2×, `listingImport` 1×, `listingPhotos` 1×) |
| `src/types/index.ts` | kód | 1 | `@/types` 8× |
| `supabase/functions/fetch-listing`, `mirror-photo` | kód (edge funkce) | 2 | knip hlásí „unused file" **falešně** — volají se přes `supabase.functions.invoke` (`listingImport.ts:63`, `storage.ts:240`) |
| `supabase/migrations/*.sql` | databáze | 14 | nikdy nemazat; `scripts/db-push.py` je aplikuje |
| `supabase/config.toml`, `supabase/.gitignore` | konfigurace (Supabase CLI) | 2 | deploy edge funkcí přes CLI (AGENTS.md §11) |
| `scripts/db-push.py` | nástroje | 1 | odkaz `.env.local.example:13`, AGENTS.md §11, 03 §6 |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | konfigurace | 5 | jádro buildu |
| `postcss.config.mjs` | konfigurace | 1 | **kandidát** — viz A |
| `eslint.config.mjs` | konfigurace | 1 | **rozbité** — viz C |
| `components.json` | konfigurace (shadcn CLI) | 1 | **zastaralé** — viz C |
| `.gitignore`, `.gitattributes`, `.env.local.example` | konfigurace | 3 | `.gitattributes` = merge driver pro `graphify-out/graph.json` |
| `.mcp.json` | konfigurace (MCP 21st.dev) | 1 | **neověřitelné** — viz C |
| `.claude/CLAUDE.md`, `settings.json`, `launch.json`, `sync.sh` | nástroje (Claude Code) | 4 | hooky sync; `launch.json` → preview 5175 (05-nastroje-a-technika.md:68) |
| `.claude/skills/graphify/**` (10), `.claude/skills/llm-council/SKILL.md` | nástroje (skilly) | 11 | graphify odkazuje CLAUDE.md, AGENTS.md §9a; council odkazuje `kontext-pro-cloud.md` §6 |
| `.design-sync/**` | nástroje (Claude Design sync) | 20 | **na vyžádání** — viz C |
| `public/White Logo - Brokerly.webp` | assets | 1 | `App.tsx:276, 417` |
| `public/Black Logo - Brokerly.png.webp` | assets | 1 | **nepoužité v kódu** — viz A |
| `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/spoluprace.md`, `docs/design-system.md` | dokumentace | 5 | všechny odkazované (README, 00-mapa, `.design-sync/config.json:20`) |
| `docs/projekt/**` (00-mapa, 01–08, council, HTML přehledy, kontext) | dokumentace | 32 | každý soubor má příchozí odkaz z `00-mapa.md` nebo z jiného dokumentu; `historie/2026-09-25-redesign-plan.md` jen přes složku (`00-mapa.md:26, 47`) |
| `docs/zdroje/**` (docx, master md, notion export 6×) | dokumentace (zdroje) | 8 | odkazy z `00-mapa.md`, README:34–35 |
| `start.sh` | nástroje | 1 | README:17, spoluprace.md |
| **Celkem** | | **139** | nic nezařazeného |

---

## 2. Výstupy nástrojů

**knip** (`npx knip --reporter compact`, uloženo v session):
- Unused files (12): `.design-sync/entry.ts`, `fonts.css`, `previews/*.tsx` (6) · `src/components/ui/dropdown-menu.tsx` · `src/components/ui/tabs.tsx` · `supabase/functions/fetch-listing/index.ts` · `supabase/functions/mirror-photo/index.ts`
- Unlisted dependency: `eslint.config.mjs` → `eslint-config-next`
- Unused exports (9 skupin): `calendar.tsx: CalendarDayButton` · `card.tsx: CardFooter, CardAction` · `dialog.tsx: DialogClose, DialogOverlay, DialogPortal, DialogTrigger` · `popover.tsx: PopoverDescription, PopoverHeader, PopoverTitle` · `select.tsx: SelectGroup, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator` · `db.ts: checkContactDuplicate` · `listingImport.ts: parseListing` · `listingPhotos.ts: absolutizeUrl` · `storage.ts: PROPERTY_PHOTO_BUCKET, PHOTO_TARGET_WIDTH, PHOTO_TARGET_HEIGHT, ensureThumb, PROPERTY_DOCUMENT_BUCKET, MAX_DOCUMENT_BYTES, photoSizeCandidates`
- Unused exported types: `listingImport.ts: ParsedListing` · `types/index.ts: PriceChange`

**depcheck**:
- Unused dependencies: `shadcn`, `tw-animate-css` — **oba falešně**: `src/index.css:2` `@import "tw-animate-css"`, `src/index.css:3` `@import "shadcn/tailwind.css"`
- Unused devDependencies: `@tailwindcss/postcss`, `tailwindcss` — `tailwindcss` falešně (`src/index.css:1` `@import "tailwindcss"`, závislost `@tailwindcss/vite`); `@tailwindcss/postcss` skutečně nadbytečný (viz A)
- Missing: `eslint-config-next` (eslint.config.mjs) · `brokerly` (`.design-sync/previews/*` — virtuální balíček ds-sync nástroje, ne chyba)

**tsc --noUnusedLocals --noUnusedParameters** (nad rámec zadání, pro oddíl B): 52 nepoužitých importů/proměnných, všechny v `App.tsx`, `ContactsView.tsx`, `DashboardView.tsx`, `KanbanView.tsx`, `PropertiesView.tsx`, `RemindersView.tsx`.

---

## 3. Zkouška (krok 5)

| | Výchozí stav | Bez kandidátů A |
|---|---|---|
| `npm run build` | exit 0, CSS 117,85 kB, JS 1 077,29 kB | exit 0, **CSS 109,05 kB**, JS beze změny |
| `npx tsc --noEmit` | exit 0 | exit 0 |

Dočasně odstraněno: `src/components/ui/dropdown-menu.tsx`, `src/components/ui/tabs.tsx`, `public/Black Logo - Brokerly.png.webp`, `postcss.config.mjs`, řádek `@tailwindcss/postcss` v `package.json`, dva řádky `export * from …tabs/dropdown-menu` v `.design-sync/entry.ts`. Vráceno `git checkout .`, `git status` čistý. Menší CSS = Tailwind už neprochází dvakrát (plugin Vite + PostCSS).

---

## A) Bezpečné hned (prošlo buildem)

| Položka | Co to je | Používá se? (důkaz) | Ověřeno 2. agentem | Návrh | Riziko |
|---|---|---|---|---|---|
| `postcss.config.mjs` + devDep `@tailwindcss/postcss` | PostCSS plugin Tailwindu | Ne. Tailwind běží přes `@tailwindcss/vite` (`vite.config.ts:6`); Vite načítá postcss.config automaticky → CSS se zpracovává dvakrát (agent: `vite/dist/node/chunks/dep-*.js:44149`). Jediný uživatel balíčku je `postcss.config.mjs:3`. Žádný odkaz v `.design-sync/config.json`, scripts, docs. | ano — redundantní | **smazat** soubor + řádek v `package.json`, pak `npm install` (přegeneruje lock) | nízké; build prošel, CSS o 9 kB menší |
| `src/components/ui/dropdown-menu.tsx` | shadcn DropdownMenu | Ne v aplikaci: žádný import v src (grep, dynamické `import(` 0). Jediný odkaz `.design-sync/entry.ts:15` (barrel pro design-sync). Komentáře `ContactsView.tsx:648`, `PropertiesView.tsx:1948, :4065` jen zmiňují slovo. | ano — částečně (jen entry.ts) | **smazat** + odebrat řádek v `.design-sync/entry.ts` | nízké; kdyby byl Dropdown potřeba při návrhu stránek, `npx shadcn add dropdown-menu` ho vrátí za minutu |
| `src/components/ui/tabs.tsx` | shadcn Tabs | Ne v aplikaci: žádný import v src; `data-slot="tabs"` jen v `tabs.tsx:15`. Jediný odkaz `.design-sync/entry.ts:12`. Detail nemovitosti má vlastní záložky bez této komponenty. | ano — částečně (jen entry.ts) | **smazat** + odebrat řádek v `.design-sync/entry.ts` + řádek v `04-design.md:102` | nízké; stejná cesta zpět jako výše |
| `public/Black Logo - Brokerly.png.webp` (40 kB) | černá varianta loga | Ne v kódu: `App.tsx:276, 417` používá jen `White Logo`. Jediná zmínka `04-design.md:83` (výčet, ne použití). Dynamické skládání cesty nenalezeno. | ano — jen v dokumentaci | **smazat** + upravit `04-design.md:83` | nízké; originál má Ondřej mimo repo (brand asset) — pokud ne, přesunout do `docs/zdroje/` místo mazání |

Po smazání A: `npx knip` přestane hlásit 2 unused files, depcheck 1 devDependency.

---

## B) Až po návrhu stránek — jen popis, co by šlo pryč

Stránky Kontakty, Dashboard, Obchody, Připomínky, Nastavení se budou předělávat (03 §3: „narychlo"). Nemá smysl je čistit po řádcích teď; tohle je inventář pro ten moment.

| Položka | Co to je | Důkaz | Návrh po návrhu stránek | Riziko |
|---|---|---|---|---|
| `DashboardView.tsx` — mock data | 4 bloky s vymyšlenými daty jako fallback, když DB nic nevrátí | `DashboardView.tsx:155` „Load Real Data or Mock Fallbacks", `:232` Mock Priorities, `:301` Mock Reminders, `:370` Mock Leads (`:392` „Jana Horáková"), `:491` Mock Properties; `:171` `prioritiesCount = … : 3` (vymyšlené číslo); 03 §4.1 | smazat všechny fallbacky, prázdný stav místo makety | žádné funkční; jen vzhled prázdného dashboardu |
| `DashboardView.tsx` — vlastní paleta `colors` | paleta mimo design systém | `DashboardView.tsx:29` `const colors = theme === 'light' ? {…}`; 03 §4.1 „vlastní barevnou paletu" | nahradit tokeny z `index.css` (`bg-panel`, `bg-surface`…) | žádné |
| `DashboardView.tsx` — nepoužité importy a props | 8 ikon lucide, `onNavigateToDeal`, `activeProperties` | tsc: `DashboardView.tsx(3,10…106)`, `(26,3)`, `(131,9)` | smazat | žádné |
| `ContactsView.tsx` — nepoužité importy | `CardTitle`, `CardDescription`, 7 ikon | tsc: `ContactsView.tsx(10,29)`, `(10,40)`, `(13,18…93)` | smazat | žádné |
| `KanbanView.tsx` — nepoužité importy + `handleDragOver` | celý import na ř. 5 nepoužitý; 7 ikon; mrtvý handler | tsc: `KanbanView.tsx(5,1)` „All imports unused", `(12,23…85)`, `(88,9)` | smazat; `handleDragOver` buď zapojit do DnD, nebo pryč | žádné |
| `RemindersView.tsx` — nepoužité importy | `CardHeader`, `Calendar` | tsc: `RemindersView.tsx(5,46)`, `(6,48)` | smazat | žádné |
| `SettingsView.tsx` — formulář bez čtenáře | 14 `useState`, ukládá do `settings`; nic hodnoty nečte (jen `App.tsx:78–81` výchozí hodnoty) | grep `reaction_limit\|escalation_rule\|qualification_questions` mimo SettingsView/types → jen `App.tsx:78-81`; 03 §3 „formulář existuje, nic ho nečte" | nechat (konfigurace pro hero tok, AGENTS §4.5), ale při návrhu zredukovat na pole, která hero tok 1.0 skutečně čte | žádné |
| `App.tsx` — zbytky | `React` import, `Key` ikona, `focusDealId` state | tsc: `App.tsx(1,8)`, `(10,67)`, `(59,10)` | smazat | žádné |
| `PropertiesView.tsx` (6 216 ř.) — mrtvé handlery a importy | `handleSaveProperty`, `wizardSummary`, `toggleLandUtility`, `handleHouseFeatureToggle`, `handleFlatFeatureToggle`, `formatCompactPrice`, `formatCurrency`, `interestedDeals`, `photoDraft`, `onNavigateToDeal`, celý import ř. 19, 8 ikon | tsc: `PropertiesView.tsx(19,1)`, `(23,30…199)`, `(221,3)`, `(304,10)`, `(605,9)`, `(739,9)`, `(754,9)`, `(761,9)`, `(771,9)`, `(1618,9)`, `(1626,9)`, `(1632,9)` | Nemovitosti nejsou „narychlo" stránka (60–70 %), takže tohle jde i dřív než B — ale soubor čeká na rozdělení (audit 26. 8.), čistit při něm | nízké; `handleSaveProperty` ověřit, že ho nenahradila jiná cesta uložení |
| Tmavý režim (`dark:` třídy 400+, `index.css:5, 97`, `App.tsx:28–33`) | vypnutý 26. 8., `theme` natvrdo `'light'` | `App.tsx:28` `const theme = 'light'`, `:33` `classList.remove('dark')`; počty `dark:` — PropertiesView 290, ContactsView 45, DashboardView 21… | **zůstává** (rozhodnutí 3. 10.); jen evidence | — |
| Nepoužité části shadcn komponent | `DialogClose`, `DialogTrigger`, `PopoverDescription/Header/Title` (nikde); `CardFooter/Action`, `SelectGroup/Label/Separator` (jen `.design-sync/previews`) | agent: `dialog.tsx:22, 14`, `popover.tsx:54, 64, 74`, `.design-sync/previews/Card.tsx:1`, `Select.tsx:1` | nechat — standardní shadcn soubory, při `shadcn add` by se vrátily; mazat jen pokud se zruší `.design-sync` | žádné |

---

## C) Rozhodnout s Ondřejem

| Položka | Co to je | Používá se? (důkaz) | Ověřeno 2. agentem | Návrh | Riziko |
|---|---|---|---|---|---|
| `eslint.config.mjs` + script `lint` | ESLint config po Next.js | **Rozbité.** `npx eslint src/main.tsx` → `ERR_MODULE_NOT_FOUND: Cannot find package 'eslint-config-next'` (`eslint.config.mjs:2-3`); balíček není v package.json ani locku. Nic lint nespouští (žádné CI, hooky, start.sh). Známé: 03 §8, 05:22. | ano — rozbité | **přepsat** na `typescript-eslint` + `eslint-plugin-react-hooks` (změna, ne mazání), nebo script `lint` i config smazat, dokud se nelintuje | nízké; dnes lint nefunguje tak jako tak |
| `components.json` | shadcn CLI config | Nic ho nečte; `shadcn add` by zapisoval do `src/app/globals.css` (neexistuje, theme je v `src/index.css:7`) a kvůli `rsc: true` přidával `"use client"`. 03 §8 říká „nechat". | ano — zastaralé | **opravit** (`"css": "src/index.css"`, `"rsc": false`), nemazat — jinak `npx shadcn add` nepůjde | nízké |
| `.mcp.json` (21st.dev MCP) | MCP server pro UI komponenty | Vznikl `06b92b9` (27. 8.), od té doby žádné použití dohledatelné; `TWENTY_FIRST_API_KEY` chybí v `.env.local.example`; otevřená otázka 03:277, 05:104, 07:151. V cloudu vyžaduje autorizaci, nešlo vyzkoušet. | ano — neověřitelné | Ondřej: používá ho lokálně? Když ne → smazat (1 soubor); když ano → doplnit proměnnou do `.env.local.example` | žádné |
| `.design-sync/` (20 souborů) + ignorované `.ds-sync/`, `ds-bundle/` | sync 6 komponent do Claude Designu | Na vyžádání, ne v buildu: tsconfig `**/*` tečkové složky nezahrnuje (`tsc --listFilesOnly` je nevypíše), Vite je ignoruje (`vite.config.ts:24`). Poslední commit `b01d2dc` 28. 9., předtím 27. 8. Pokrývá 6 z 15 ui komponent. 03 §8 „nechat, sync jen na vyžádání". `04-design.md:4-5` odkazuje na `conventions.md` a `NOTES.md` jako historii rozhodnutí. | ano — na vyžádání | **rozhodnout**: (a) nechat, nebo (b) smazat celou složku a `NOTES.md` + `conventions.md` přesunout do `docs/projekt/04-design/historie/` (jediná část s trvalou hodnotou). Pokud se Claude Design už nepoužije, (b). | střední jen pro (b): sync by se musel nastavit znovu (~1 h) |
| `src/lib/db.ts: checkContactDuplicate` | dedup kontaktu podle telefonu/e-mailu | **Používá se** — knip hlásí jen zbytečné `export`: volá ji `createContact` (`db.ts:85`); požadavek AGENTS.md §6 „dedup před create, vždy". | ano — používá se | nechat; jen odebrat `export` (knip ztichne) | žádné |
| Ostatní „unused exports" (`parseListing`, `absolutizeUrl`, konstanty v `storage.ts`, `CalendarDayButton`, `Dialog/Select*`, `PriceChange`) | funkce/typy použité jen uvnitř vlastního souboru | agent: všechny mají interní použití (`listingImport.ts:116`, `listingPhotos.ts:53…`, `storage.ts:29, 118, 155, 163, 241, 247`, `types/index.ts:89`); nikde = jen `DialogClose`, `DialogTrigger`, `Popover{Description,Header,Title}` | ano | nechat; volitelně odebrat `export` u lib funkcí (kosmetika pro knip) | žádné |
| `.claude/settings.json` hooky `graphify hook-guard` | PreToolUse hooky na absolutní cestu `/Users/ondrejzeman/.local/bin/graphify` | `settings.json:8, 17` — cesta existuje jen na Ondřejově Macu; u Filipa a v cloudu hook tiše selhává | — (konfigurace, ne mazání) | nahradit `graphify` v PATH nebo hook podmínit `command -v graphify` | nízké; dnes jen šum v logu |
| `docs/zdroje/Brokerly_master_dokument.docx` (40 kB binár) | původní Word, zdroj pravdy | Odkazován 5× (00-mapa, 03 §8); textová verze `master-dokument-2026-07.md` vedle | — | nechat (rozhodnuto 1. 10.) | žádné |
| `docs/projekt/03-stav-aplikace/historie/2026-09-25-redesign-plan.md` | plán redesignu detailu | Žádný přímý odkaz na název, ale `00-mapa.md:26, 47` odkazuje na složku; obsahuje unikátní zdůvodnění alternativ 1–3 a záznam schválení (`:3, :94`) | ano — nechat | nechat jako historii | žádné |
| `package.json` dependency `shadcn` (CLI, 4.x) | CLI + `shadcn/tailwind.css` | `src/index.css:3` importuje CSS z balíčku → runtime závislost, ne jen CLI | — | nechat v `dependencies` | žádné |

---

## Co z toho plyne

1. **A je malé** (4 položky, ~2 min práce) a bez rizika — jediný reálný zisk je konec dvojího zpracování CSS.
2. **Největší balast je v kódu stránek**, ne v souborech: 52 nepoužitých symbolů a 4 bloky mock dat v Dashboardu. Čistit až s návrhem stránek (B), jinak se práce dělá dvakrát.
3. **Tři věci jsou rozbité nebo zastaralé, ne nadbytečné**: `eslint.config.mjs`, `components.json`, hook na absolutní cestu. Potřebují opravu, ne smazání.
4. Oba nástroje mají falešné nálezy (knip: edge funkce; depcheck: `shadcn`, `tw-animate-css`, `tailwindcss`) — proto je ruční ověření nutné a ve výsledku je **každý nález buď potvrzený, nebo vyvrácený s důkazem**.

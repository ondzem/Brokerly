# 05 — Nástroje a technika

Na čem Brokerly běží, čím se staví a co to stojí. Stav k 1. 10. 2026.

---

## 1. Stack aplikace (realita, ne AGENTS.md)

| Vrstva | Co | Poznámka |
|---|---|---|
| Build / dev server | **Vite 6** | `npm run dev` → `http://localhost:5175` (port přenastaven 25. 9., 5173/5174 zabírají jiné projekty) |
| UI | **React 19.2** + **TypeScript 5** | jedna stránka, stav v React, bez routeru (záložky přes `localStorage`) |
| Styl | **Tailwind v4** (`@tailwindcss/vite`) | tokeny jako CSS proměnné v `src/index.css`; lokální CSS jen pro detail nemovitosti (`property-detail.css`) |
| Komponenty | **shadcn/ui** nad **Base UI** (`@base-ui/react`) | 15 komponent v `src/components/ui/`; upravené, ne stock |
| Ikony | lucide-react | monochromaticky |
| Data | **Supabase** (Postgres + Storage + Edge Functions) | klient `@supabase/supabase-js`, anon klíč ve frontendu |
| Toasty | sonner | |
| Datum | date-fns, react-day-picker | |

> **Rozpor:** AGENTS.md §3 říká „Next.js (App Router)". Projekt vznikl 5. 7.
> jako Create Next App a **tentýž den byl přepsán na Vite**. Next.js nikde není,
> jen zbytky (`eslint-config-next`, `public/next.svg`, prefix `NEXT_PUBLIC_`).
> AGENTS.md opravit.

**Žádný backend kromě Supabase.** Žádný vlastní server, žádné API, žádný
cron, žádná fronta. Pro vrstvu 2 (automatizace) bude třeba rozhodnout, kde
poběží (Supabase Edge Functions + pg_cron? n8n/Make? vlastní server?) —
viz [07 §3](07-otevrene-otazky.md).

---

## 2. Databáze — Supabase

- **Projekt:** `xmfjnrwypcbektwatbil` (ref), jedna instance, **sdílená oběma
  vývojáři i jako testovací prostředí**. Neexistuje oddělené dev/staging/prod.
- **Tabulky:** `contacts`, `properties`, `deals`, `activities`, `settings`,
  `custom_options`; `_brokerly_migrations` (evidence spuštěných migrací).
- **Storage:** `property-photos` (veřejný, 10 MB), `property-documents`
  (veřejný, 20 MB). Veřejný = kdokoli s URL soubor přečte; URL jsou náhodná.
- **RLS:** zapnuté, politiky `true` pro všechny (etapa 1 bez auth).
- **Migrace:** soubory v `supabase/migrations/`, spouští **`python3
  scripts/db-push.py`** přes Management API (potřebuje `SUPABASE_ACCESS_TOKEN`).
  Pouští **jen jeden člověk** — dopad je pro oba. Destruktivní migrace =
  potvrdit předem.
- **Edge Functions** (Deno, `supabase functions deploy <name> --project-ref … --no-verify-jwt`):

| Funkce | Co dělá | Proč na serveru |
|---|---|---|
| `fetch-listing` | stáhne stránku/JSON inzerátu pro import; SSRF ochrany (jen http(s), veřejné hostname, 6 MB, 15 s), cookie jar přes Seznam autologin; u Sreality `api/v1/estates/{id}` | prohlížeč portály nestáhne (CORS, consent lišta) |
| `mirror-photo` | stáhne fotku z povolených portálů (Sreality, iDNES, RE/MAX, Bezrealitky, …) a uloží do `property-photos` | fotky z cizích CDN mizí, až portál inzerát stáhne |

Oboje v **bezplatném tieru** Supabase.

- **Supabase Dashboard:** https://supabase.com/dashboard/project/xmfjnrwypcbektwatbil

---

## 3. Vývojářský režim ve dvou

| Co | Jak |
|---|---|
| Repozitář | **`github.com/ondzem/Brokerly`, veřejný**, větev `main`, oba zapisují přímo (bez PR) |
| Start bez Claude | `./start.sh` — stáhne cizí změny, spustí server, po `Ctrl+C` commitne a nahraje |
| V Claude Code | **`.claude/sync.sh`** přes hooky v `.claude/settings.json`: `SessionStart` + `UserPromptSubmit` = pull, `Stop` = commit + pull + push. Po každé odpovědi je práce na GitHubu |
| Pauza nahrávání | soubor **`.claude/.sync-paused`** (28. 9.) — práce se commituje lokálně, nepushuje. **Dnes je pauza ZAPNUTÁ** na Ondřejově počítači; pushuje se jen na výslovné „nahraj" |
| Konflikt | sync se zastaví, nic nenahraje; „vyřeš konflikt" nebo `git rebase --abort` |
| Pravidla | nikdy `push --force`, nikdy `reset --hard` na sdílené; předem si říct, kdo dělá co |
| Preview v Claude | `.claude/launch.json` → připojí se k běžícímu serveru na 5175 (server se startuje ručně, odpojený od session, přežije uspání, ne restart) |

Lidský návod: `docs/spoluprace.md`. Pravidla pro agenty: AGENTS.md §11.

---

## 4. Tajné klíče

`.env.local` (gitignored, posílá se soukromě):

| Proměnná | K čemu |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | adresa projektu |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | veřejný klíč klienta (je v buildu, ne tajný) |
| `SUPABASE_ACCESS_TOKEN` | osobní token pro migrace a deploy funkcí — **tajný** |

Odstraněno 21. 9.: `NEXT_PUBLIC_GEMINI_API_KEY`, `NEXT_PUBLIC_SCRAPER_API_KEY`
(už se nepoužívají — **předplatná ScraperAPI a Gemini jde zrušit**).

Pravidlo: repo je veřejné — **nikdy klíč do commitu, do trackovaného souboru,
ani do chatu.** Nové proměnné: název do `.env.local.example`, hodnota soukromě.

---

## 5. AI a pomocné nástroje při stavbě

| Nástroj | Role | Stav / poznámka |
|---|---|---|
| **Claude Code** (desktop app) | hlavní stavební nástroj; všech 151 commitů vzniklo s ním | pravidla v `AGENTS.md`, `CLAUDE.md`, globálním `~/.claude/CLAUDE.md` |
| **graphify** | znalostní graf repa (`graphify-out/`, gitignored); `graphify explain/path/query` místo čtení 6000řádkového souboru; post-commit hook obnovuje; PreToolUse hook **vynucuje** dotaz na graf před grepem | od 18. 8.; lokální, bez API nákladů |
| **claude-mem** | paměť napříč sessions (pozorování, rozhodnutí) | od 16. 8.; OAuth token občas expiruje → přihlásit v Claude Desktop |
| **ruflo** (claude-flow) | paměť `brokerly` namespace, routing úloh, agenti | od 21. 9.; **jen lokální runtime** — nikdy `ruflo init` (přepsal by sync hooky) |
| **superpowers** skilly | brainstorming → plán → provedení → ověření; systematic-debugging | globální policy |
| Design skilly | `minimalist-ui`, `high-end-visual-design`, `design-taste-frontend`, `web-design-guidelines` | AGENTS.md §10 |
| **Claude Design / DesignSync** | katalog komponent + tokeny (`ds-bundle/`, `.ds-sync/`, `.design-sync/`) | 26.–27. 8.; sync **jen na vyžádání** |
| **ChatGPT / codex** | první návrh dvousloupcového detailu (25. 9., větev `codex/property-detail-redesign`, sloučena) | příležitostně |
| 21st.dev MCP (`.mcp.json`) | knihovna UI komponent | používá se? `?` |
| headroom proxy (port 8787) | lokální proxy pro Claude API | infrastruktura Ondřejova počítače, ne projektu |

### Služby, se kterými zadání počítá pro vrstvu 2 (nic z toho není napojené)

Vrstva 2 se bude stavět **v kódu nad Supabase** (Edge Functions, pg_cron),
ne v no-code nástrojích. Tohle jsou externí služby, které zadání (Notion
„procesy") jmenuje a které zůstávají kandidáty:

| Potřeba | Kandidát ze zadání | Poznámka |
|---|---|---|
| příjem poptávky | alias `makler@brokerly.cz` nebo forward z Gmail/Seznam | parsování e-mailu si napíšeme sami (edge funkce), stejně jako import inzerátu |
| AI | **Claude API** | odpovědi v tónu makléře, triáž, digest, kontrola dokumentů |
| e-mail jménem makléře | **Resend** | HTML šablona digestu |
| SMS | **smsbrana** | remindery, notifikace; STOP = zrušení |
| rezervace | **Cal.com** napojený na Google/Outlook kalendář makléře | pod brandem klienta; webhook k nám |
| podklady od majitelů | **Google Drive API** | složka na makléřově Drive (GDPR) |
| scraping | **Filipův existující Sreality scraper pro CC listy** („NEMO_tracker") + Bazoš | jediná hotová technika vrstvy 2, leží mimo repo |
| Studio | CubiCasa / Matterport, Floorplanner, Virtual Staging AI, Reimagine Home, Photoshop | servis, ne build |

Výběr konkrétních služeb (a jestli např. rezervaci nepostavit vlastní) je
otevřený — [07 §3](07-otevrene-otazky.md).

---

## 6. Nasazení a provoz

- **Nenasazeno.** Běží jen lokálně. Žádná doména, hosting, SSL, monitoring,
  zálohy nad rámec Supabase.
- `README` zmiňuje deployovatelnost (Vercel + Supabase); `public/_redirects`
  je zbytek pro Netlify. Ani jedno není nastavené.
- Před nasazením nutné: přihlášení (Supabase Auth), RLS podle uživatele,
  rozdělení tenantů (jeden makléř = jedna data), oddělené prostředí od
  vývojového.

---

## 7. Náklady dnes

| Položka | Kč/měs |
|---|---|
| Supabase | 0 (free tier) |
| Hosting | 0 (nic neběží) |
| Gemini, ScraperAPI | 0 od 21. 9. (**zrušit předplatná, pokud ještě běží**) |
| Claude Code, ChatGPT | osobní předplatná Ondřeje |
| Doména brokerly.cz | `?` |

Master dokument počítal s ~1K/měs na klienta (nástroje, API, SMS) — to je
náklad vrstvy 2, která neexistuje.

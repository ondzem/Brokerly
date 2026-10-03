# 03 — Stav aplikace k 1. 10. 2026

Co dnes reálně existuje v kódu a databázi, jak se to stavělo, čím se to liší od
specifikace, co víme, že je rozbité, a co je balast.

---

## 1. V jedné větě

Máme **funkční, vizuálně propracované ruční CRM** (etapa 1 „Denní jádro"):
6 obrazovek nad 5 tabulkami v Supabase, běžící lokálně na Vite + React, bez
přihlášení, bez nasazení, bez jediné automatizace. Nejvíc práce šlo do
nemovitostí (přidání, import z inzerátu, fotky, detail); kontakty jsou o generaci
pozadu; kanban, připomínky a nastavení jsou funkční a jednoduché.

---

## 2. Obrazovky — co která umí

Navigace: levý sidebar (desktop) / horní zelená lišta s hamburgerem (mobil).
Záložky: Dashboard · Obchody (kanban) · Kontakty · Nemovitosti · Připomínky
· Nastavení. Aktivní záložka a otevřený detail se pamatují přes obnovení stránky.

### 2.1 Dashboard („rozcestník") — `rozestavěno`

- Pozdrav podle denní doby a jména makléře, datum.
- Bloky: **Dnešní priority**, **Připomínky** (z databáze), **Nové poptávky**,
  **Aktivní obchody**, počty nemovitostí v nabídce a kontaktů.
- **Problém:** část obsahu je **natvrdo vymyšlená** (Jana Horáková, Byt 2+kk
  Koterovská 18, Dvořákovi…) — maketa z 6. 7., která se nikdy nepropojila s daty.
  Má vlastní barevnou paletu mimo design systém.

### 2.2 Obchody — kanban — `hotovo`

- Sloupce = fáze (Lead, Kontaktován, Kvalifikován, Prohlídka, Nabídka,
  Rezervace, Podpis, Prohráno); kartička: název, financování, další krok + termín.
- **Drag & drop** mění fázi (zapíše se do DB, toast).
- Detail obchodu v dialogu: úprava polí, zapsání aktivity / připomínky.
- Nový obchod: výběr kupujícího (povinný) + nemovitosti.
- Horizontální scroll na mobilu.

### 2.3 Kontakty — `hotovo`, UX stará generace

- Seznam: tabulka na desktopu / karty na mobilu; záložky Zájemci / Vlastníci;
  hledání; filtry podle nemovitosti (druh, prodej/pronájem, konkrétní nemovitost,
  dispozice, lokalita).
- Nový kontakt: základ, role, zdroj, stav, poznámka, blok **Co hledá**
  (transakce, druh, lokalita, dispozice, rozpočet, účel, aktivně hledá do),
  blok **Souhlas GDPR**.
- Detail: všechna pole **pořád v editačním režimu** (jeden překlep = tichá
  změna), bez záložek; „Obchody tohoto klienta", „Nemovitosti tohoto klienta
  (vlastník)", **Historie kontaktu** (timeline), **Zapsat aktivitu / připomínku**
  (typ, text, kdy, směr, výsledek follow-upu).
- **Dedup** při založení (telefon → e-mail) — od 26. 8. „aditivní": přidá roli,
  nepřepíše stav; servisní hlášky už nelepí do poznámky.

### 2.4 Nemovitosti — `hotovo`, nejpropracovanější

**Seznam:** karty (foto, štítky Prodej/V nabídce, titul = druh + dispozice,
cena, adresa, parametry, počet „zájemců" = matching) nebo řádkový seznam
s fotkou; hledání (adresa, druh, transakce, vlastník, cena, ID inzerátu);
**filtr panel ve stylu Sreality** (potvrzuje se tlačítkem, ne při každém kliku).

**Přidání nemovitosti — rozcestí se třemi cestami:**

| Cesta | Co dělá |
|---|---|
| **Mám odkaz na inzerát** | Vložíš URL ze Sreality / iDNES / RE/MAX / Bezrealitky / dalších → serverová funkce stáhne stránku (u Sreality jejich veřejné JSON API) → parser vytáhne adresu, cenu, všechny parametry, popis → **fotky se zkopírují do našeho úložiště** (jinak by zmizely, až portál inzerát stáhne). Zdarma — od 21. 9. bez Gemini a ScraperAPI. |
| **Zadám ručně** (průvodce) | 6 kroků: vlastník (vč. založení nového kontaktu inline) → druh a transakce → kde to stojí (našeptávač adres) → jak je to velké (parametry podle druhu) → fotky (drag & drop + ořez 3:2) → ostatní (fakta pro odpovědi, termín předání, provize, poznámka). Krokové hlídání povinných polí. |
| **Radši vše na jedné stránce** | Expertní režim, stejná pole na jedné obrazovce (parita s průvodcem ověřena 27. 8.). |

Vybavení (výtah, bazén, sítě…) jde **rozšířit o vlastní štítky** a přeřadit —
ukládá se sdíleně v DB (`custom_options`). U výběrových polí jde „jiné — napíšu
vlastní".

**Detail nemovitosti** (redesign 25.–28. 9.): na desktopu **dvousloupcový
dossier** — vlevo fotka (roste do výšky panelu) + náhledy + titul/štítky/adresa/
cena/cena za m²/vlastník, vpravo lišta se záložkami + **pás parametrů** + obsah.
Na mobilu a tabletu jednosloupcově s lepivou lištou. Záložky:

| Záložka | Obsah |
|---|---|
| **Přehled** | Zájemci (obchody s 5bodovým průběhem fáze) · Finance (provize, náklady, čistá provize) · Co dál a aktivita (timeline) |
| **Informace** | Obecné parametry (editovatelné) · Parametry podle druhu (editovatelné) · Poznámka · **Dokumenty** (nahrání PDF/skenů/Excelu, prohlížení v aplikaci, stažení, smazání) · historie ceny se zapisuje automaticky |
| **Zájemci** | Filtr podle fáze, karty zájemců s telefonem, poznámkou, fází a průběhem, inline úprava, přidání zájemce, **Možní zájemci** (matching z poptávkových profilů) |
| **Provize** | Sazba % z ceny → částka, stav (očekávaná / potvrzená), seznam nákladů, čistá provize |

**Galerie fotek:** celoobrazovková, mřížka, přeřazení tažením (první = titulní),
nastavit jako titulní, smazat, přidat s ořezem, otevřít na konkrétní fotce.
Všechny fotky jsou **1200×800 (3:2)** — nikdy neskáčou.

Akce: duplikovat nemovitost, odstranit (s potvrzením).

### 2.5 Připomínky — `hotovo`

Filtr: připomínka = ano, hotovo = ne, kdy ≤ dnes; řazení dle kdy; odškrtnutí.
Prázdný stav „Máte hotovo".

### 2.6 Nastavení asistenta — `hotovo` jako formulář

Všech 15 polí ze specifikace (jméno, telefon, e-mail, podpis, oslovení, tón,
ukázky odpovědí, jazyky, reakční limit, pravidlo eskalace, pracovní doba,
kvalifikační otázky + 3 office-only). **Nic na ně nenavazuje** — konfigurace bez
spotřebitele.

---

## 3. Databáze — co je, a čím se to liší od specifikace

Supabase Postgres, projekt `xmfjnrwypcbektwatbil`, **jedna sdílená instance
pro oba vývojáře** (= i jedna testovací data pro oba). 15 migrací.

### Tabulky

`contacts` · `properties` · `deals` · `activities` · `settings` (5. 7.) +
`custom_options` (20. 8.). Storage buckets: `property-photos` (10 MB, jpeg/png/
webp, 18. 8.) a `property-documents` (20 MB, PDF/obrázky/Word/Excel/txt/csv/zip,
25. 8.).

### RLS

Zapnuté, ale **politiky `USING (true)` — kdokoli s anon klíčem čte i zapisuje
všechno.** Etapa 1 nemá přihlášení, tohle je vědomé; **před jakýmkoli nasazením
na veřejnou adresu je to blokátor.** (Anon klíč je ve frontendu, tj. veřejný.)

### Co je NAVÍC oproti specifikaci (AGENTS.md §7: „nepřidávat pole")

| Pole / věc | Kde | Proč vzniklo |
|---|---|---|
| `commission_pct`, `commission_val`, `commission_status`, `costs` | properties | záložka Provize (6.–12. 7.) — ekonomika obchodu, makléř to chce vidět |
| `note` (oddělená od `facts_for_answers`) | properties | 25. 8. — poznámka makléře a podklad pro AI byly jedno pole |
| `documents` (JSON s URL, velikostí, datem) | properties | 25. 8. — dřív „+ Nahrát" přepisovalo fotky |
| `price_history` | properties | 25. 8. — dřív dvě natvrdo napsaná čísla |
| `created_at` na properties | properties | 25. 8. |
| `custom_options` | tabulka | 20. 8. — vlastní štítky vybavení |
| uvolněné CHECK constrainty (ownership, construction, condition, house_type, penb) | properties | 20. 8. — „jiné — napíšu vlastní" |
| bloky pozemek / komerční / pronájem **vyplnitelné v UI** | formuláře | 17. 8. — spec: „nevyplňovat v etapě 1" |
| `comm_parking_entrance` používané i u bytu jako „Parkování" | properties | |
| **Matching „Možní zájemci"** | logika | 6. 7. — funkce z etapy 2 (MAKLÉŘ+) |
| **Import z inzerátu** + mirror fotek | edge funkce | 6. 7. / 25. 8. / 21. 9. — není ve spec vůbec; „obrácený směr" k auto-publikaci |

Verdikt: nic z toho není špatně — jsou to věci, které makléř reálně potřebuje.
Ale **specifikace (AGENTS.md §4) už neodpovídá realitě** a je třeba ji
aktualizovat, nebo rozhodnout, co se vrací.

### Co CHYBÍ nebo se ODCHÝLILO

| Co | Stav |
|---|---|
| **Teplota (skóre)** u kontaktu i dealu | Ve spec povinný koncept (A/B/C kvalifikace, „komu volat první"). V DB sloupec je; z UI byla **odstraněna** (6. 7. „remove temperature field across the board", 24. 8. „teplota removed everywhere"). U zájemců nahrazena **průběhem fáze** (28. 8.). Důvod rozhodnutí není zapsán. |
| GDPR blok | Pole jsou, ale nic nehlídá (souhlas bez data i zdroje). |
| `listing_id` jako párovací klíč | Pole je, vyplňuje se z importu; dřív se předvyplňovalo náhodným 6místným číslem (6. 7.) — nejasné, zda ještě. |
| Testovací průchod etapy 1 | Nezaznamenán. |
| Přihlášení, více makléřů (tenanti) | Není. Vědomě (etapa 1). |
| Nasazení (doména, hosting) | Není. `public/_redirects` pro Netlify je zbytek po ScraperAPI proxy. |

---

## 4. Jak se to stavělo — časová osa

| Období | Co vzniklo |
|---|---|
| **5.–6. 7.** | Založení (nejdřív omylem Create Next App, pak Vite). Schéma DB, RLS, sidebar, všechny obrazovky v první verzi, dashboard, dialogy nemovitosti/kontaktu, dynamická pole podle druhu, **import z inzerátu přes ScraperAPI + Gemini**, provize, matching kupujících, světlý/tmavý režim. *Dva dny, obrovský kus.* |
| **8.–9. 7.** | Redesign seznamu nemovitostí (karty 4 sloupce, tabulka, filtry), mobilní navigace, responzivita. |
| **12. 7.** | Detail nemovitosti se záložkami a inline editací; responzivita dialogu. |
| **14. 7.** | `Detail nemovitosti - mobil.html` (maketa), první `start.sh`, testovací nemovitosti do migrací. |
| *14. 7. → 17. 8.* | **pauza 5 týdnů** |
| **17.–18. 8.** | Bloky pozemek/komerční/pronájem, přidání nemovitosti jako **průvodce**, vykání, našeptávač adres, **graphify**, **drag & drop fotky s ořezem**. |
| **20. 8.** | **Práce ve dvou**: `start.sh` pro dva, sync hooky, `spoluprace.md`, migrace přes `db-push.py`, vlastní štítky vybavení. |
| **24.–26. 8.** | Filtr panel, redesign kontaktů, poznámka/dokumenty/historie ceny do DB, galerie fotek, **mirror fotek do vlastního úložiště**, design systém sepsán a nahrán do Claude Designu, surface tokeny, **vypnutí tmavého režimu**, **kritický audit** (24 bodů) + první kolo oprav. |
| **27.–28. 8.** | Jemnější paleta, parita jednostránkového formuláře, zájemci podle fáze místo teploty, detail jako „prezentace inzerátu", prohlížení dokumentů v aplikaci. |
| *28. 8. → 21. 9.* | **pauza 3 týdny** |
| **21. 9.** | ruflo napojen, **import z inzerátu bez Gemini a ScraperAPI** (vlastní edge funkce + parser, zdarma), opravy přidávání na malých telefonech, Vite nereloaduje při zápisech nástrojů. |
| **25.–28. 9.** | **Redesign detailu nemovitosti** (dvousloupcový dossier, ChatGPT/codex návrh → doladění), náhledy fotek, pás parametrů, mobilní lišta, tmavší podklad, pauza auto-nahrávání. |

Celkem 151 commitů v 18 pracovních dnech. Všechny od `ondzem`.

---

## 5. Známé problémy (otevřené z auditu 26. 8. a od té doby)

Z `docs/projekt/03-stav-aplikace/audit-2026-08-26.md` je opraveno: A1, A2 (dedup), A3, A4 (poctivé
počty), C13 (hledání), C16 (filtr stavů), část D. **Otevřené:**

| # | Problém | Závažnost |
|---|---|---|
| B7 | Detail kontaktu = jedna dlouhá editace, bez čtecího režimu, jiná generace než nemovitosti | vysoká — nejviditelnější nekonzistence |
| C12 | `PropertiesView.tsx` má **6 216 řádků** — seznam, detail, průvodce, import, galerie, filtry v jednom. Každá změna je riskantní | vysoká — technický dluh |
| A5/A6 | Záporná čistá provize zeleně; nevyplněná provize jako „0 Kč očekávaná" | střední |
| B8 | Select vlastníka v editaci ukazuje UUID | střední |
| B9 | Kontakt jen-doporučitel není v žádné záložce | střední |
| B10, C14 | Žádné řazení (kontakty ani nemovitosti) | střední |
| B11 | GDPR nic nehlídá | střední |
| C15 | Prázdný stav při filtru říká „Přidej první nemovitost" | nízká |
| C17 | Staré nemovitosti s fotkami z cizích serverů — zpětná migrace do úložiště | nízká |
| D18–21 | Kontakty ve staré vizuální generaci; saturované stavové barvy; tokeny jen v části kódu; tři různé zelené na akcích | střední |
| D22 | Ikonová tlačítka bez jmen; panel filtrů nejde zavřít Escape | nízká |
| E23 | Volba Karty/Seznam a filtry se nepamatují | nízká |
| E24 | Aktivita z karty kontaktu vždy `done = ano` | nízká |
| nový | Dashboard: vymyšlená data, vlastní paleta | střední |
| nový | Seznam nemovitostí a dashboard nepoužívají surface tokeny (vlastní `colors`) | nízká |
| nový | `npm run lint` nejde spustit (chybí `eslint-config-next` — zbytek po Next.js) | nízká |
| nový | ~338 `dark:` tříd a `.dark` blok leží v kódu mrtvé | nízká |

---

## 6. Balast — co v projektu leželo a nepoužívá se

Vyčištěno 1. 10. 2026 (vše je v git historii, kdyby bylo třeba):

| Co | Proč to tam bylo | Hotovo |
|---|---|---|
| `Brokerly Dashboard - standalone.html`, `Detail nemovitosti - mobil.html` | makety z července, od té doby dvakrát předělané | smazáno |
| `Brokerly_master_dokument.docx` v kořeni | hlavní zdroj pravdy jako Word v kořeni | přesunut do `docs/zdroje/`; textová verze v `docs/zdroje/master-dokument-2026-07.md` |
| `scratch/` | pracovní soubory z července | smazáno |
| `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` | zbytky po Create Next App, nikde nepoužité | smazáno |
| `public/_redirects` | Netlify proxy pro ScraperAPI, které už není | smazáno |
| AGENTS.md §3 „Next.js (App Router)" | nepravda — projekt je Vite + React | opraveno |

Zbývá k rozhodnutí:

| Co | Proč je to tam | Co s tím |
|---|---|---|
| `dist/`, `tsconfig.tsbuildinfo` | výstup buildu, cache TypeScriptu | v `.gitignore`, jen lokální — nic k řešení |
| `eslint.config.mjs` → `eslint-config-next` | zbytek po Next.js; lint nejde spustit | přepsat na Vite/React config (změna, ne mazání) |
| `components.json` | shadcn konfigurace | nechat |
| `.ds-sync/` (vč. vlastního `node_modules`), `ds-bundle/` | nástroje a výstup synchronizace do Claude Designu (26.–27. 8.) | nechat, ale sync se dělá jen na vyžádání |
| `agentdb.rvf`, `agentdb.rvf.lock`, `ruvector.db` (1,6 MB), `.claude-flow/`, `.swarm/`, `.claude/memory.db` | lokální stav ruflo/agentdb | v `.gitignore`; ověřit, že `ruvector.db` tam je |
| `.mcp.json` (21st.dev MCP) | nástroj na UI komponenty | používá se? `?` |
| `.env.local.example`: `NEXT_PUBLIC_*` prefix | historický, Vite ho čte přes `envPrefix` | nechat (změna = oba musí přepsat `.env.local`) |
| tmavý režim v kódu | vypnutý 26. 8. | rozhodnout: vrátit, nebo vyčistit |

---

## 7. Co z toho plyne

1. **Etapa 1 je de facto hotová, ale neuzavřená.** Chybí formální testovací
   průchod a aktualizace specifikace podle toho, co se reálně postavilo.
2. **Největší riziko dalšího vývoje je `PropertiesView.tsx`.** Než se začne
   stavět vrstva 2, rozdělit.
3. **Kontakty** potřebují stejnou generaci jako nemovitosti — jinak bude
   produkt působit jako dva různé.
4. **Před prvním klientem** je blokátor přihlášení + RLS; bez toho nejde nic
   nasadit na veřejnou adresu.

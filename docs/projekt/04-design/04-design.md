# 04 — Design: jak Brokerly vypadá a proč

Zdroj pravdy pro hodnoty: [`design-system.md`](design-system.md) (CZ).
Historie ladění palety a konvence komponentového katalogu z doby synchronizace
do Claude Designu (**zrušeno 3. 10. 2026**): `historie/design-sync-NOTES.md`,
`historie/design-sync-conventions.md`. Tenhle dokument je shrnutí + rozhodnutí
+ reference + co je nekonzistentní. Hodnoty tu neopakuji do detailu.

---

## 1. Charakter — „editorial premium minimal"

Nástroj pro **prestižní, dobře placenou profesi**. Má působit jako drahý
editorial časopis potkávající čistotu **Linearu / Notionu** — ne jako křiklavý
generický SaaS, ne jako výchozí shadcn.

Tři principy v pořadí důležitosti:

1. **Klid.** Hodně bílého místa, silná typografická hierarchie, žádná dekorace.
2. **Rychlost pro uživatele.** Makléř je ve spěchu. Žádné pomocné texty navíc,
   krátké popisky, všechno přečitatelné za vteřinu. Méně věcí, zato přehledně.
3. **Na míru.** Vlastní odstíny, vlastní rytmus, jeden střídmý akcent.

Čemu se vyhýbáme: gradienty, výrazné stíny, bublinaté tvary, neonové stavové
barvy, SaaS modrá, ikony jako dekorace, animace pro efekt.

**Když si nejsi jistý: ubrat.** Menší písmo, tenčí linka, méně barvy, víc
prostoru.

---

## 2. Stavební kameny (zkráceně)

| Co | Hodnota |
|---|---|
| **Fonty** | Inter (UI) · Hanken Grotesk (velké nadpisy, `font-display`) · Geist Mono (výjimečně čísla) — z Google Fonts |
| **Škála** | pixelová, malá: 14,5 px výchozí; 13–13,5 seznamy; 12,5 sekundární; **11 px / 600 / VERZÁLKY / tracking-wider = mikro-popisek** (páteř hierarchie, popisek *nad* hodnotou, nikdy vedle); 30–36 px / **300** nadpisy |
| **Inverze vah** | velké věci lehké (300), malé věci tučné (600) — odtud editorial pocit |
| **Akcent** | jedna zelená. `#0E8A5F` (text, akce) / `#00D991` (svítivá — aktivní záložka, primární tlačítko) / `#00221F` (tmavá — mobilní lišta, značka). Když jsou na obrazovce dvě zelené věci, jedna je navíc |
| **Vrstvení** | `--panel #F4F6F1` (podklad: tělo, lišty) · `--surface #FFFFFF` (karty, menu, vstupy) · `--inset #EFF6F1` (blok vyříznutý do karty) · **jediná váha linky** `--hairline rgba(11,31,26,.06)` |
| **Stavové barvy** | vždy dvojice podklad + text, tlumené: pozitivní `#DCF5E7/#0B5C3D`, kritický `#FADFD9/#A33A28`, varovný `#FBEED8/#8A5A16`, neutrální `#ECEBE6/#55605C` |
| **Tvar** | rádius 6 px základ, 10–12 px karty, 5 px vstupy, full štítky. Stín jen `shadow-sm` na kartě, jinak hloubka linkou a mezerou |
| **Rytmus** | 4 px; `gap-2` uvnitř skupiny, `gap-4` mezi skupinami, `p-5` v kartě; ovládací prvky v řadě **stejně vysoké** |
| **Pohyb** | `duration-150` výchozí; drag & drop má viditelnou odezvu; `prefers-reduced-motion` respektováno |
| **Jazyk** | rozhraní **česky**, **vykání**, popisky krátké, bez uvozovacích frází |

V Tailwindu: `bg-panel`, `bg-surface`, `bg-inset`, `border-hairline`; nikdy
`bg-white` / `bg-slate-*`.

---

## 3. Rozhodnutí, která padla (a proč)

| Kdy | Rozhodnutí | Důvod |
|---|---|---|
| 5. 7. | Levý sidebar s ikonami, logo nahoře | místo horní navigace; na mobilu horní zelená lišta + hamburger (8. 7.) |
| 6. 7. | Světlý i tmavý režim s přepínačem; tmavý = tmavě zelený, ne šedý | |
| 26. 8. | **Tmavý režim vypnut**, aplikace jede light-only | ladění dvou palet zdvojovalo práci; `.dark` blok a ~338 `dark:` tříd zůstaly v kódu spící |
| 17. 8. | **Vykání** v celé aplikaci | profesní nástroj |
| 18. 8. | Všechny fotky **1200×800 (3:2)** s povinným ořezem | galerie a karty nikdy neskáčou; změna formátu = dvě konstanty |
| 26.–28. 8. | **Surface škála** — pět kol ladění podkladu (`#F2F1EC` → `#F6F5F1` → `#FCFCF9` → `#FDFDFB/#FCFDFA` → **`#F4F6F1`** 28. 9.) | první kola: „karty moc výrazné, pruhy"; poslední: s hustým detailem karty nevystupovaly. Poučení v NOTES.md: linka a mezera jsou první páka, výplň až poslední |
| 26. 8. | **Jedna váha linky** `.06`; druhá váha (`--hairline-soft`) zrušena | dvě váhy = vizuální šum |
| 28. 8. | Zájemci označeni **fází v procesu**, ne teplotou | 5bodový průběh je čitelnější než horký/vlažný/studený (viz 03 — teplota zmizela i z dat) |
| 28. 8. | Fakta na kartě nemovitosti **jednobarevně** (ikona + hodnota), bez barevných dlaždic, **bez ikon na záložkách** | „ikony monochromatické, žádné ikony u záložek" |
| 21. 9. | Titul karty = **druh + dispozice** („Byt 4+kk"), adresa pod ním; ulice jako titul **zamítnuta** | |
| 25. 9. | Detail nemovitosti = **dvousloupcový dossier** (portrét vlevo ~25 %, obsah vpravo); návrh přišel z ChatGPT/codex, doladěn | na 1280×720 zabírala stará hlavička 380 px; obsah začínal až od 420 px |
| 26.–28. 9. | Parametry **vedle obsahu** (pás pod záložkami jako karta), na mobilu v panelu jako mřížka 3×2 se zkrácenými dělítky; na mobilu bílá 64px lišta jako navbar appky; náhledy fotek pod hlavní fotkou; „Přidat foto" | série rozhodnutí z živého ladění s Ondřejem |
| 27. 8. | Design systém **nenahrávat do Claude Designu automaticky**, jen na vyžádání | zdlouhavé, ladění se dělá v aplikaci |
| 3. 10. | **Synchronizace do Claude Designu zrušena** — `.design-sync/` smazána, poznámky přesunuty do `historie/`; `.mcp.json` (21st.dev) smazán | nepoužívalo se od 28. 9.; ladění se dělá v aplikaci |

---

## 4. Reference

- **Systémové:** Linear, Notion, Raycast, Superhuman (skill `design-md-library`)
  — bere se *systém* (škála, rytmus, zdrženlivost), nikdy brand.
- **Oborové (28. 8.):** RE/MAX, Sreality, **LuxuryPresence** — „90–95 % od nich
  + vlastní spin" pro prezentaci nemovitosti; detail má působit jako inzerát na
  prémiovém portálu, ne jako formulář.
- **Linear na Refero** — disciplína rozložení detailu (plán 25. 9.).
- **Nástroje:** skilly `minimalist-ui`, `high-end-visual-design`,
  `design-taste-frontend`, `redesign-existing-projects`,
  `web-design-guidelines` (přístupnost po každé UI změně) — AGENTS.md §10.

Logo: `public/White Logo - Brokerly.webp` (sidebar). Černá varianta byla v repu nepoužitá a 3. 10. smazána (originál má Ondřej mimo repo).
Jiné brandové podklady (barvy loga, typografie značky, tone of voice mimo
aplikaci) **neexistují** nebo nejsou v repu.

---

## 5. Co je nekonzistentní (ze stejného auditu, pořád platí)

1. **Kontakty** — stará generace vizuálu (tučný 2xl nadpis, výchozí shadcn),
   zatímco nemovitosti mají editorial vzor. Dvě generace vedle sebe.
2. **Dashboard a seznam nemovitostí** mají vlastní `colors` objekt a plátno
   `#F2F1EC` místo surface tokenů. NOTES.md: „převod potřebuje vlastní kolo,
   ne find-and-replace".
3. **Tři zelené na akcích** (`#00D991`, `#0E8A5F`, `emerald-600`) — sjednotit.
4. **Stavové barvy kontaktů** saturované (emerald/amber/sky/indigo) místo
   tlumených dvojic.
5. Tokeny `bg-panel/surface/hairline` jen v části PropertiesView; zbytek natvrdo
   hexy — změna palety = hon na hexy.
6. ~~Komponentový katalog v Claude Designu zahrnuje jen 6 z 15 komponent~~
   — synchronizace zrušena 3. 10. 2026; nepoužité `tabs.tsx` a
   `dropdown-menu.tsx` smazány (zbývá 13 ui komponent).

---

## 6. Design mimo aplikaci — co neexistuje a bude potřeba

Master dokument počítá s dalšími vizuálními výstupy, pro které zatím není nic:

- **Ranní digest** (HTML e-mail) — „tvář produktu", má mít osobní tón, do
  designu investovat.
- **PDF report pro vedení kanceláře** — „vizuál musí působit seriózně, to
  vedení kupuje".
- **Rezervační stránka** pod brandem klienta (Cal.com nebo vlastní).
- **E-maily jménem makléře** (odpověď na poptávku, follow-up, výroční,
  žádost o recenzi) — šablony v makléřově tónu.
- **Prodejní materiály:** ceník, PDF prezentace, case study (roadmapa červenec).
- **Web brokerly.cz** — není; doména je koupená (2. 10. 2026).

Všechno z toho spadá do Ondřejovy domény (design a texty) a nic z toho nezačalo.

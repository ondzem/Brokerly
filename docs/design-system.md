# Brokerly — Design system

Zkopíruj celý tenhle soubor do Claude Design (nebo do jakéhokoli jiného
nástroje) jako kontext. Popisuje, jak Brokerly vypadá a proč — ne jednotlivé
obrazovky.

---

## 1. Charakter

**„Editorial premium minimal."** Nástroj pro prestižní, dobře placenou profesi
(realitní makléř). Má působit jako drahý editorial časopis potkávající čistotu
Linearu / Notionu — **ne** jako křiklavý generický SaaS.

Tři principy, v tomhle pořadí:

1. **Klid.** Hodně bílého místa, silná typografická hierarchie, žádná dekorace.
   Obsah první.
2. **Rychlost pro uživatele.** Makléř je ve spěchu. Žádné pomocné texty navíc,
   krátké popisky, všechno přečitatelné za vteřinu. Radši méně věcí na obrazovce,
   zato přehledně.
3. **Na míru.** Nesmí to vypadat jako výchozí shadcn. Vlastní odstíny, vlastní
   rytmus, jeden střídmý akcent.

Čemu se vyhnout: gradienty, výrazné stíny, zaoblené „bublinaté" tvary, neonové
stavové barvy, primární SaaS modrá, ikony jako dekorace, animace pro efekt.

---

## 2. Barvy

Aplikace má **plnohodnotný světlý i tmavý režim**. Tmavý není invertovaný
světlý — je to tmavě zelený, ne šedý, a akcent se v něm mění na svítivější tón.

### Světlý režim

| Role | Hex | Použití |
|---|---|---|
| Plátno (pozadí) | `#F2F1EC` | teplá kamenná, nikdy čistě bílá |
| Karta / povrch | `#FFFFFF` | ostrůvky obsahu na plátně |
| Text primární | `#0B1F1A` | téměř černá s nádechem zelené |
| Text sekundární | `rgba(11,31,26,0.6)` | |
| Text tlumený | `rgba(11,31,26,0.5)` | popisky, metadata |
| Akcent | `#0E8A5F` | hluboká lesní zelená |
| Akcent — podklad | `#DCF5E7` | |
| Akcent — text na podkladu | `#0B5C3D` | |
| Ohraničení | `stone-300 / 60 %`, tloušťka **0,5 px** | |

### Tmavý režim

| Role | Hex |
|---|---|
| Plátno | `#00221F` (velmi tmavá zelená, ne šedá) |
| Karta / povrch | `#072C27` |
| Text primární | `#FFFFFF` |
| Text sekundární | `rgba(232,232,232,0.6)` |
| Text tlumený | `rgba(232,232,232,0.5)` |
| Akcent | `#00D991` (svítivá mátová) |
| Akcent — podklad | `rgba(0,217,145,0.13)` |
| Akcent — text na podkladu | `#4FE0AC` |
| Ohraničení | `rgba(255,255,255,0.10)`, tloušťka 0,5 px |

### Stavové barvy — vždy tlumené, nikdy neonové

Vždy dvojice **podklad + text**, používá se jako štítek (chip), ne jako plná
výplň.

| Stav | Světlý podklad / text | Tmavý podklad / text |
|---|---|---|
| Pozitivní / horký | `#DCF5E7` / `#0B5C3D` | `rgba(0,217,145,0.13)` / `#4FE0AC` |
| Kritický / prohráno | `#FADFD9` / `#A33A28` | `rgba(216,82,60,0.16)` / `#EC9483` |
| Varovný / vlažný | `#FBEED8` / `#8A5A16` | `rgba(232,161,60,0.15)` / `#EFC183` |
| Neutrální / studený | `#ECEBE6` / `#55605C` | `rgba(232,232,232,0.10)` / `#C3CFCC` |

**Pravidlo:** akcentová zelená je jediná sytá barva v rozhraní. Používej ji
střídmě — aktivní stav, primární tlačítko, jedno zvýraznění v bloku. Když jsou
na obrazovce dvě zelené věci, jedna z nich je navíc.

---

## 2b. Vrstvení — čím se věci oddělují

Systém neodděluje obsah stínem a skoro ani plochou. Odděluje ho **vlasová linka
a mezera**. Jsou dvě úrovně a díra:

| Token | Role | Světlý |
|---|---|---|
| `--panel` | podklad — tělo stránky/dialogu **včetně hlavičky, lišty se záložkami a patičky** | `#FCFDFA` |
| `--surface` | cokoli vyvýšeného — karty, menu, plovoucí prvky, vstupy | `#FFFFFF` |
| `--inset` | blok vyříznutý do karty — prázdné stavy, výzvy k nahrání | `#EFF6F1` |

**Jediná váha linky:** `--hairline` = `rgba(11,31,26,.06)`. Obrys, který uzavírá
kartu, a dělítko pod záložkami jsou tentýž tah. Silnější se nezavádí.

**Rozdíl ploch je pod 1 jednotku L\* a sám o sobě nic nedělí.** Panel a surface
jsou skoro stejná bílá; práci odvede linka a prostor kolem bloku. Zvětšení
rozdílu ploch čte jako pruhy — bylo to zkoušeno dvakrát a dvakrát zamítnuto.

**Pruh není třetí odstín.** Přišpendlená hlavička nebo patička bere `panel`
stejně jako tělo, ke kterému patří.

**Silnější ohraničení jen tam, kde nese stav.** Rozcestníkové dlaždice,
vybíratelné řádky a hover používají akcent; prosté ohraničení nikdy.

V Tailwindu: `bg-panel`, `bg-surface`, `bg-inset`, `border-hairline`.

---

## 3. Typografie

| | Font | Kde |
|---|---|---|
| UI / text | **Inter** (variabilní) | všechno běžné |
| Nadpisy | **Hanken Grotesk** (`font-display`) | velké nadpisy stránek |
| Čísla / kód | **Geist Mono** | výjimečně |

**Škála je jemná a záměrně malá** — pixelové hodnoty, ne Tailwind kroky:

| Velikost | Použití |
|---|---|
| `24px`, váha **300 (light)**, `tracking-tight` | velká čísla, metriky |
| `30–36px`, váha **300**, `font-display` | nadpis stránky |
| `15px`, váha 600 | nadpis sekce / karty |
| `14,5px`, váha 500–600 | **výchozí velikost textu v aplikaci** |
| `13px – 13,5px` | text v seznamu, řádky tabulky |
| `12,5px` | sekundární informace |
| `11px`, váha 600, **VELKÁ PÍSMENA**, `tracking-wider` | mikro-popisky nad hodnotami |
| `10px` | nejjemnější metadata, počítadla |

Dvě věci, které dělají celý charakter:

- **Velké věci jsou lehké** (váha 300), **malé věci jsou tučné** (600).
  Přesný opak toho, co dělá běžný SaaS. Odtud pochází ten editorial pocit.
- **Mikro-popisek**: `11px / 600 / uppercase / tracking-wider / tlumená barva`.
  Tenhle jeden vzorec se v aplikaci opakuje 56×. Je to páteř hierarchie —
  popisek nad hodnotou, ne popisek vedle hodnoty.

---

## 4. Tvar, prostor, hloubka

- **Rádius:** základ `0.375rem` (6 px). Nejčastěji `rounded-xl` (12 px) na
  kartách, `rounded-md` (≈5 px) na vstupech a tlačítkách, `rounded-full` na
  štítcích a avatarech. Nic „bublinatého".
- **Ohraničení:** **0,5 px vlasová linka**, ne 1 px. Tohle je podstatné — dělá
  to ten drahý dojem. Oddělovače uvnitř karty jsou ještě jemnější
  (`stone-100`, resp. `white/5`).
- **Stín:** jen `shadow-sm`, a to pouze na kartě. Nikdy větší. Hloubka se dělá
  ohraničením a odstupem, ne stínem.
- **Rozestupy:** rytmus 4 px. `gap-2` (8 px) uvnitř skupiny, `gap-4` (16 px)
  mezi skupinami, `p-5` (20 px) uvnitř karty.
- **Výšky ovládacích prvků:** `h-10` (40 px) výchozí, `h-9` kompaktní,
  `h-8` u štítků. Tlačítka a vstupy vedle sebe musí mít **stejnou výšku** —
  nezarovnané prvky jsou nejčastější chyba.

---

## 5. Pohyb

Minimální a účelový. `duration-150` je výchozí, `duration-200/300` jen u větších
přechodů (otevření galerie). Žádné pružiny, žádné odskoky, žádná animace, která
si říká o pozornost. Výjimka: drag & drop má dostat viditelnou zpětnou vazbu
(zvednutí karty, zelená vkládací linka mezi položkami).

---

## 6. Vzorce, které se opakují

- **Karta:** bílý povrch, 0,5px linka, `rounded-xl`, `p-5`, `shadow-sm`.
  Nadpis 15px/600, pod ním mikro-popisky + hodnoty.
- **Popisek + hodnota:** VELKÁ PÍSMENA 11px tlumené nad hodnotou 14,5px/600.
  Nikdy dvojtečka, nikdy vedle sebe.
- **Štítek stavu:** `rounded-full`, `px-2`, 11px/600, dvojice podklad+text
  z tabulky výše.
- **Prázdný stav:** jedna věta tlumeným textem, žádná ilustrace.
- **Jazyk:** rozhraní je **česky**. Popisky krátké, bez uvozovacích frází.

---

## 7. Když si nejsi jistý

Ubrat. Menší písmo, tenčí linka, méně barvy, více prostoru. Když volíš mezi
„vysvětlit to uživateli" a „udělat to tak jasné, že to vysvětlovat nemusíš",
vždycky to druhé.

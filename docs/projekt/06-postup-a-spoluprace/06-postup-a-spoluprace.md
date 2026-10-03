# 06 — Postup a spolupráce

Jak na projektu pracujeme: lidé, pravidla, etapy, a jak na to navazuje
Ondřejova metodika z webových projektů.

---

## 1. Kdo

| | Role podle master dokumentu (7/2026) | Realita (10/2026) |
|---|---|---|
| **Ondřej Zeman** | data, design, šablony textů, vizuál digestu a reportů, provoz AI Studia | staví **celou aplikaci** s Claude Code; design; dokumentace; vlastník repa a Supabase |
| **Filip Netolický** | technika: automatizace, AI prompty, kvalifikace, API napojení, scraping, digest | druhý vývojář s přístupem (od 20. 8.); vlastník Notionu; má hotový scraper Sreality mimo repo; v git historii bez commitů |
| Adéla (admin), externí builder | od podzimu / od 8 klientů | nezačalo |

Doménové vymezení z července **neodpovídá tomu, co se staví** (viz 07 §2).

---

## 2. Pravidla práce ve dvou (platí, krátce)

1. GitHub `ondzem/Brokerly`, `main`, oba přímo. Žádné posílání složek.
2. Před prací stáhnout, po práci nahrát — v Claude Code automaticky
   (sync hooky), bez něj `./start.sh`.
3. **Říct si dopředu, kdo dělá co** („dneska nemovitosti, ty kontakty").
   Git spojí různé soubory sám, stejný řádek ne.
4. Konflikt = stop, nic se nenahraje, „vyřeš konflikt".
5. Nikdy `push --force`, `reset --hard` na sdílené commity.
6. Databáze je **jedna pro oba** — co jeden smaže, je pryč pro oba. Migrace
   pouští jeden člověk.
7. Klíče jen soukromě, nikdy do repa.

Podrobně: `docs/spoluprace.md`, AGENTS.md §11.

---

## 3. Pravidla pro AI agenty (AGENTS.md — co z toho je důležité i pro lidi)

- **Nejdřív plán, pak stavba** — před kódem krátký plán a schválení.
- **Rozsah je zákon** — etapa 1 = 5 tabulek + 4 pohledy, bez automatizací.
  Cokoli z pozdější etapy → zastavit a zeptat se.
- **Nic nevymýšlet navíc** — datový model přesně podle §4.
  *(Realita: přidalo se dost — provize, dokumenty, import, matching.
  Pravidlo se v praxi neuplatňovalo; buď ho uvolnit, nebo spec dohnat.)*
- **Jedna věc na krok**, přezkoumatelné změny.
- Odpovídat česky, stručně.
- Design: §8 vítězí nad skilly; po každé UI změně kontrola přístupnosti.
- Graf (graphify) místo čtení velkých souborů.

---

## 4. Etapy a brány

```
ETAPA 1  Denní jádro        5 tabulek · 4 pohledy · ruční provoz        ◄ tady
   │  brána: testovací deal lead → podpis jen přes pohledy, nic nedrhne
ETAPA 2  Hero tok           speed-to-lead + eskalace nad hotovými tabulkami
   │  brána: testovací poptávka projede kroky 1–8 bez ručního zásahu
ETAPA 3  Pilot              reálný makléř, měří se reakční čas, eskalace, no-show
   │  brána: jedna reálná poptávka projde až k follow-upu
dál      vrstvy „navrch"    matching · follow-up majitelů · digest · triáž · akvizice · kancelář
```

Brána etapy 1 **nebyla formálně projita** (viz 03 §3). Nikdo nerozhodl, že
etapa 1 je hotová — ale od 17. 8. se nestavělo nic jiného než její vylepšování.

---

## 5. Jak se pracovalo doteď (vzorec)

Ondřej zadá slovně (často diktovaný text), Claude Code:

1. prohlédne stav v prohlížeči (preview na 5175, všechny šířky),
2. navrhne a udělá změnu,
3. ověří v prohlížeči (screenshoty, měření, přetečení),
4. `npm run build`, commit; push jen na „nahraj".

Funguje to pro UI iterace. Nefunguje to pro: větší architektonické kroky
(rozdělení PropertiesView), rozhodnutí o produktu (ta vyžadují oba zakladatele),
a cokoli, co vyžaduje Filipovy znalosti (automatizace, portály, SMS).

Tempo: 18 pracovních dnů za 3 měsíce, dvě pauzy po 3–5 týdnech. Každý návrat
stál „kde jsme" — proto tahle složka.

---

## 6. Ondřejova metodika z webů — a jak ji použít tady

Z `o-me-a-me-sluzbe.md` a `Metodika_dotaznik_a_podklady.md`. U webu pro
klienta jde postup:

| Krok u webu | Obdoba pro Brokerly | Stav |
|---|---|---|
| 1. Poznávací schůzka | Zakladatelské rozhovory — master dokument z července je jejich výstup | hotovo (7/2026) |
| 2. **Sepsání informací a podkladů** | **tahle složka `docs/projekt/`** | **hotovo (1. 10.)** |
| 3. **Dotazník** — „lékařská anamnéza": kdo jste → kam jdete → co vás brzdí → pro koho → co od toho čekáte → jak chcete být vidět | dotazník **na nás dva** — otázky, které nejdou zodpovědět z dokumentů; podklad je [07](../07-otevrene-otazky/07-otevrene-otazky.md) | další krok |
| 4. Podklady (portál) — co existuje: čísla, recenze, přístupy | co existuje: piloti? klienti? smlouvy? Notion? čísla z call-centra? | k posbírání |
| 5. Hovor — rozhodnutí, která potřebují debatu | zakladatelská schůzka nad 07 | |
| 6. **Strategie** — struktura, pořadí, proč | produktová strategie + přepsaná roadmapa + rozhodnutí o architektuře vrstvy 2 | |
| 7. Wireframe + texty | specifikace vrstvy 2 (hero tok) do úrovně AGENTS.md | |
| 8. Design → vývoj → integrace → spuštění | etapa 2 → pilot | |

**Tři kanály, nemíchat** (z metodiky): co vyžaduje přemýšlení → dotazník; co
existuje a stačí poslat → podklady; co vyžaduje rozhodnutí a debatu → hovor.
Tohle platí i pro nás dva: do dotazníku nepatří „jaké máme ceny" (to je
v dokumentu), patří tam „proč vlastní CRM a ne vrstva nad cizím".

**Kontrola dotazníku:** každá kapitola strategie musí mít zdroj v některé
otázce. Kapitoly budoucí strategie Brokerly a jejich zdroje jsou předběžně
v 07 §8.

---

## 7. Co se má změnit v postupu (návrhy, ne rozhodnutí)

1. **Aktualizovat AGENTS.md** podle reality (stack, pole navíc, odložené bloky,
   teplota) — jinak každá session začíná s nepravdivou specifikací.
2. **Uzavřít etapu 1 formálně** — projít testovací průchod, zapsat výsledek do
   `docs/projekt/03-stav-aplikace/historie/`.
3. **Před etapou 2 rozdělit `PropertiesView.tsx`** a dodělat kontakty — jinak
   se vrstva 2 staví na písku.
4. **Rozhodnutí o produktu dělat ve dvou a zapisovat** (`docs/rozhodnuti/` nebo
   ADR) — dnes jsou rozhodnutí jen v commitech a chatech.
5. **Roadmapu přepsat** na reálné tempo (večery a víkendy, dva lidi) a vázat ji
   na brány, ne na měsíce.

# Kontext pro novou session (cloud)

> Předávací dokument. Kdo ho čte, pokračuje v rozhovoru s Ondřejem tam, kde
> skončila lokální session 2. 10. 2026. Přečti ho celý, pak `00-mapa.md`.

## 1. Jak s Ondřejem mluvit

- **Česky, neformálně, tykání.** Maximálně stručně: problém → řešení, nebo rovnou výsledek.
- Žádný úvod, žádné shrnutí na konci, žádné rekapitulace, co jsi udělal.
- Postup = číslované kroky, každý max. 1 řádek. Když něco nevíš, zeptej se jednou větou.
- Nenabízej další možnosti a doplňky, pokud nejsou nutné.
- Ondřej šetří tokeny. U velkých úloh používej subagenty na menších modelech
  (Sonnet/Haiku) a silný model jen na hlavní úsudek.

## 2. Kdo jsme a kde jsme

- **Brokerly** = done-for-you AI back office + CRM pro české realitní makléře.
  Služba, ne jen software: nastavíme, napojíme, provozujeme. Model hub-and-spoke
  (CRM = data, automatizace = ruce). Detail v `01-mise-a-vize.md`.
- Dva zakladatelé: **Ondřej** (design, texty, obchod, metodika) a **Filip**.
  Filipovy odpovědi na dotazník zatím chybí — nečekáme na ně.
- **Aplikace:** etapa 1 (CRM jádro: kontakty, nemovitosti, obchody, aktivity,
  nastavení) je postavená. Stav v `03-stav-aplikace.md`. Kód teď nestavíme.
- **Fáze projektu:** sepsání všeho → dotazník → **teď: produkt a služby (dokument 02)**
  → strategie → wireframe → stavba.

## 3. Co padlo v posledních dnech (už rozhodnuto)

- Mise jednou větou: **„asistent, který jedná za tebe."** (s tečkou).
- Pilotní klientka: makléřka **Dorina Šedíková**. Slib: **40+ h měsíčně** ušetřeno.
- Cíle: **1 000 makléřů v ČR, 10 000 globálně.**
- Inspirace značky: luxurypresence.com, mozekrealit.cz (THEON), wextra, burocratik.
- Doména **brokerly.cz** je koupená (Forpsi, Ondřejův účet). Web zatím není.
- **10 obav makléřů** (dotazník, otázka 12) přijato 2. 10. — v `dotaznik-mise-a-vize.md` a `02` §3.13.
- **Cesta klienta v 10 krocích** (`cesta-klienta.html`): 3 zdroje leadů → prezentace
  v 5 krocích → interaktivní dotazník → plán na míru → platba 33/33/33 nebo celá →
  setup → 1–3 měsíce ladění → upsell (−20 %, složka na klienta) → doporučení.
  Klient může odejít v každém kroku.
- **Co postavit ke každému kroku:** `co-postavit.html` (máme / nové / odstranit).
- **Konkurence** (`konkurence.md`, ~40 produktů). Hlavní závěry:
  - **Hero tok speed-to-lead** (odpověď na poptávku z portálu do pár minut → rezervace
    prohlídky → připomínka → follow-up → ranní digest) **v ČR ani v Evropě nikdo nemá.**
  - Nejbližší konkurent modelem služby: **THEON / mozekrealit** (zavedení na míru, ladění po 14 dnech).
  - Nejbližší konkurent AI vizí: **stret.ai** (hlasové zadávání, AI odpovědi se schválením).
  - Trend 2026: **„AI připraví, makléř schválí"** → potřebujeme schvalovací režim.
  - Jádro CRM je dnes standard; rozdíl dělají automatizace. Export na portály, weby
    makléřů, e-podpis a AI popisky nedohánět.
- **Katalog služeb** (`sluzby-katalog.html`): 10 bloků, ~70 služeb, u žlutých položek
  inspirace z konkurence se zdrojem.

## 4. Co je otevřené

1. **Ondřej rozhoduje beru / neberu / později** u žlutých inspirací v `sluzby-katalog.html`.
   → K tomu slouží council (níže).
2. Pak finální seznam služeb zapsat do `02-produkt-a-sluzby.md` a projít otázky k 02.
3. Filipův dotazník.

## 5. Pravidla repa (platí i v cloudu)

- Repo je **veřejné**: žádné klíče, tokeny ani hesla do souborů ani do chatu.
- **Nepushuj do `main`.** Commituj a pushuj do své větve; Ondřej si ji stáhne lokálně.
- Nesahej na `src/`, `supabase/` ani databázi. Tahle session je strategie a dokumenty.
- `AGENTS.md` platí pro kód aplikace (etapa 1). Pro dokumenty a strategii z něj
  ber jen kontext (datový model, design).

## 6. Další krok: council nad službami

Skill: `.claude/skills/llm-council/SKILL.md` (5 poradců → 5 anonymních recenzí → předseda).

**Otázka pro council:**
„Které služby z katalogu (~70) patří do **první placené verze pro sólo makléře**
(pilot Dorina), které **později** a které **nikdy**? Co v katalogu **chybí**?
U žlutých inspirací z konkurence doporuč beru / neberu / později s jednou větou proč."

**Úspora tokenů (dodrž):**
1. Hlavní vlákno připraví jeden kompaktní vstup `docs/projekt/council/vstup.md`
   (~5–8k tokenů): mise, cílový makléř, cesta klienta zkráceně, závěry konkurence,
   **celý seznam služeb s jednou větou na službu** (z `sluzby-katalog.html` a `02`).
2. Vstup se poradcům vloží **přímo do zadání** — subagenti nečtou soubory sami.
3. Poradci a recenzenti: model **Sonnet**. Předseda: silný model (Opus).
4. Poradce max. 400 slov (víc služeb než u běžné otázky), recenze max. 200 slov.
5. Předseda navíc vrátí **tabulku všech služeb: teď / později / nikdy + důvod**.

**Výstup:** do `docs/projekt/council/`
- `council-report-2026-10-XX.html` — report podle skillu, česky, v duchu designu
  Brokerly (`04-design.md`: klid, jedna zelená `#0E8A5F`, Inter, žádné gradienty).
- `council-transcript-2026-10-XX.md` — celý přepis.
Pak commit + push do své větve a pošli Ondřejovi odkaz.

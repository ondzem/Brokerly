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
- **Co postavit a v jakém pořadí:** `plan-stavby.html`.
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

## 4. Co je hotové a co je otevřené

- **Katalog služeb je uzavřený:** `sluzby-katalog.html` (po dvou councilech 2. 10.,
  podklady v `council/`). Staré verze a přehledy jsou v `docs/archiv/`.
- **Pořadí stavby je v `plan-stavby.html`:** krok 0 (ověření u Doriny) → verze 1.0
  (milníky M1–M6, pilot se spouští po M3) → 1.1 → 1.2 → 1.3 → 2.0 → 3.0.
- Otevřené: pět rozhodnutí v kroku 0 plánu (cena pilotu, fakturace, kdo co staví,
  nástroje, rozsah v AGENTS.md) a Filipův dotazník.

## 5. Pravidla repa (platí i v cloudu)

- Repo je **veřejné**: žádné klíče, tokeny ani hesla do souborů ani do chatu.
- **Nepushuj do `main`.** Commituj a pushuj do své větve; Ondřej si ji stáhne lokálně.
- Nesahej na `src/`, `supabase/` ani databázi. Tahle session je strategie a dokumenty.
- `AGENTS.md` platí pro kód aplikace (etapa 1). Pro dokumenty a strategii z něj
  ber jen kontext (datový model, design).

## 6. Další krok

Řiď se `plan-stavby.html`. Council skill je v `.claude/skills/llm-council/SKILL.md`;
při dalším councilu vkládej poradcům vstup přímo do zadání a poradce i recenzenty
pouštěj na Sonnetu, předsedu na silném modelu. Výstupy ukládej do `docs/projekt/council/`.

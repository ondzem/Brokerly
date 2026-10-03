# Brokerly — mapa projektových dokumentů

> **K čemu to je.** Tahle složka je „sepsání všeho, co o projektu víme" ke dni
> 1. 10. 2026. Vznikla proto, že se do projektu po pauzách špatně vrací: vize
> leží v jednom Wordu z července, pravidla v AGENTS.md, rozhodnutí v commitech
> a v hlavách. Tady je to na jednom místě, rozdělené podle témat.
>
> **Co to není.** Není to strategie ani plán. Je to inventura — první krok
> podle stejné metodiky, jakou Ondřej používá u webů (sepsání informací →
> dotazník → strategie → wireframe → stavba). Dotazník „na nás dva" a strategie
> přijdou až nad těmihle dokumenty.

## Kde začít

**[Plán projektu](02-produkt-a-sluzby/plan-stavby.html)** — úkolníček celého projektu
od podkladů přes strategii po stavbu (fáze A–D), u každého bodu co to je, proč a kdy je hotový. Ukazuje, kde právě jsme a co je další krok.

## Složky

Každé téma má svou složku. Hlavní dokument má číslo, vedle leží materiály k němu.

| Složka | Hlavní dokument | Materiály v ní | Na co odpovídá |
|---|---|---|---|
| **01** Mise a vize | [01-mise-a-vize.md](01-mise-a-vize/01-mise-a-vize.md) — co Brokerly je, pro koho, jaký problém řeší, čím vyhrává | [dotazník](01-mise-a-vize/dotaznik-mise-a-vize.md) (17 otázek, Ondřejovy odpovědi) | *Proč to děláme a pro koho?* |
| **02** Produkt a služby | [02-produkt-a-sluzby.md](02-produkt-a-sluzby/02-produkt-a-sluzby.md) — provozní detaily funkcí z master dokumentu | [**katalog služeb**](02-produkt-a-sluzby/sluzby-katalog.html) (78 položek) · [**plán projektu**](02-produkt-a-sluzby/plan-stavby.html) · [cesta klienta](02-produkt-a-sluzby/cesta-klienta.html) (10 kroků) · [konkurence](02-produkt-a-sluzby/konkurence.md) (~40 produktů) · `council/` (dva councily z 2. 10.) | *Co má Brokerly umět a v jakém pořadí?* |
| **03** Stav aplikace | [03-stav-aplikace.md](03-stav-aplikace/03-stav-aplikace.md) — co dnes v kódu a databázi reálně je | [audit 26. 8.](03-stav-aplikace/audit-2026-08-26.md) · `historie/` (plán a ověření redesignu 25. 9.) | *Kde právě jsme?* |
| **04** Design | [04-design.md](04-design/04-design.md) — vizuální pravidla, rozhodnutí, nekonzistence | hodnoty tokenů v [design-system.md](04-design/design-system.md); historie synchronizace do Claude Designu (zrušeno 3. 10.) v `04-design/historie/` | *Jak to má vypadat?* |
| **05** Nástroje a technika | [05-nastroje-a-technika.md](05-nastroje-a-technika/05-nastroje-a-technika.md) — stack, databáze, AI nástroje, klíče, náklady | [nahrávání a ořez fotek](05-nastroje-a-technika/image-crop-uploader.md) | *Na čem to stavíme?* |
| **06** Postup a spolupráce | [06-postup-a-spoluprace.md](06-postup-a-spoluprace/06-postup-a-spoluprace.md) — jak pracujeme, etapy, definice hotového | návod pro kolegu je v `docs/spoluprace.md` (odkazuje na něj AGENTS.md a README) | *Jak pracujeme?* |
| **07** Otevřené otázky | [07-otevrene-otazky.md](07-otevrene-otazky/07-otevrene-otazky.md) — rozpory a nevyjasněné věci | — | *Co musíme rozhodnout před strategií?* |
| **08** Byznys a plán | [08-byznys-a-plan.md](08-byznys-a-plan/08-byznys-a-plan.md) — ceny, go-to-market, roadmapa, tým, rizika | — | *Jak a kdy to zpeněžíme?* |

Mimo složky: [kontext-pro-cloud.md](kontext-pro-cloud.md) (předávací dokument
pro cloud sessions) a `docs/zdroje/` (master dokument z července a export
z Notionu). Nahrazené verze katalogu, sitemapa služeb a „co postavit“ byly
smazány 3. 10.; najdeš je v historii gitu.

## Zdroje, ze kterých to vzniklo

| Zdroj | Co obsahuje | Stav |
|---|---|---|
| `docs/zdroje/Brokerly_master_dokument.docx` (5. 7. 2026) | **Hlavní zdroj pravdy.** 24 kapitol: produkt, byznys, trh, ceny, roadmapa, tým, celý datový model, automatizace, provozní detaily, pořadí stavby, KPI | Přečteno celé. Textová verze: `docs/zdroje/master-dokument-2026-07.md` |
| `AGENTS.md` | Pravidla pro AI agenty: rozsah etapy 1, datový model, design systém, práce ve dvou | Přečteno |
| `README.md`, `docs/spoluprace.md` | Spuštění, synchronizace, onboarding kolegy | Přečteno |
| `docs/projekt/04-design/design-system.md`, `04-design/historie/design-sync-*.md` | Design systém a historie ladění palety (dřív `docs/design-system.md` a `.design-sync/`) | Přečteno |
| `docs/projekt/03-stav-aplikace/audit-2026-08-26.md` | Kritický audit kontaktů a nemovitostí — 24 bodů | Přečteno |
| `docs/projekt/03-stav-aplikace/historie/` | Plán a ověření redesignu detailu nemovitosti (25. 9.) | Přečteno |
| `docs/projekt/05-nastroje-a-technika/image-crop-uploader.md` | Technická specifikace nahrávání a ořezu fotek | Přečteno |
| `supabase/migrations/*` (15 souborů), `supabase/functions/*` | Skutečné schéma databáze a serverové funkce | Přečteno |
| `src/` (36 souborů, 14 700 řádků) | Kód aplikace — prošly se obrazovky, ne řádek po řádku | Prošlo se |
| Git historie (151 commitů, 5. 7.–28. 9. 2026) | Co se kdy stavělo a proč | Prošlo se |
| Paměť z předchozích Claude sessions (claude-mem, ruflo, memory) | Rozhodnutí a preference z práce od 16. 8. | Prošlo se |
| **Notion „Brokerly"** (Filipův workspace, 5 stránek) | Business plán, „Co bude aplikace umět", **procesy s konkrétními nástroji a pravidly**, ukázkový průchod hero tokem, tři patra CRM vs. stret.ai, 6 fází práce makléře, prodejní trychtýř | Přečteno celé 1. 10. (export). Kopie v `docs/zdroje/notion-export-2026-10/`. Je to **předloha master dokumentu** — ten z něj vznikl; Notion má navíc konkrétní nástroje, pravidla a chytré detaily |
| `Checklist_stavby_CRM.xlsx` (zmíněn v master dokumentu, kap. 23) | 120 úkolů stavby s vysvětlením | **Nenalezen** v repu ani ve složce |

## Jak dokumenty číst

- **Fakta vs. stav.** Všechno z master dokumentu je uvedeno jako „co bylo
  rozhodnuto v červenci". Kde se od té doby realita posunula nebo odchýlila,
  je to označeno `► Stav 10/2026:`.
- **Statusy** u funkcí a úkolů: `hotovo` · `rozestavěno` · `plán` ·
  `odloženo` · `zamítnuto` · `?` (nevíme).
- Dokument 07 je nejdůležitější pro další krok — každá otázka v něm má
  odkaz na místo, kde rozpor vznikl.

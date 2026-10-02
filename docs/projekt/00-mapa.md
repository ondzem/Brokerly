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

## Dokumenty

| # | Dokument | Co v něm je | Na co odpovídá |
|---|---|---|---|
| 01 | [Mise a vize](01-mise-a-vize.md) | Základní pravidla: co Brokerly je, jaký problém řeší, pro koho, čím vyhrává | *Proč to děláme a pro koho?* |
| — | [Dotazník mise a vize](dotaznik-mise-a-vize.md) | 17 otázek pro oba zakladatele, které 01 doladí (podle metodiky anamnézy) | *Co si o tom každý z nás doopravdy myslí?* |
| 02 | [Produkt a služby](02-produkt-a-sluzby.md) | Kompletní katalog všeho, co má systém umět: balíčky, hero funkce, mapa automatizace po fázích práce makléře, provozní detaily každé funkce, KPI, etapy stavby | *Co všechno chceme postavit a v jakém pořadí?* |
| 03 | [Stav aplikace](03-stav-aplikace.md) | Co dnes reálně existuje v kódu a databázi, čím se to liší od specifikace, časová osa stavby, známé problémy, co je balast k vyčištění | *Kde právě jsme?* |
| 04 | [Design](04-design.md) | Vizuální identita, tokeny, pravidla, reference, rozhodnutí, co je nekonzistentní | *Jak to má vypadat?* |
| 05 | [Nástroje a technika](05-nastroje-a-technika.md) | Stack, databáze, hosting, vývojářské nástroje, AI nástroje, tajné klíče, náklady | *Na čem to stavíme a čím?* |
| 06 | [Postup a spolupráce](06-postup-a-spoluprace.md) | Jak pracujeme ve dvou, pravidla etap, definice hotového, jak navazuje Ondřejova webová metodika | *Jak pracujeme?* |
| 07 | [Otevřené otázky](07-otevrene-otazky.md) | Rozpory mezi dokumenty a realitou, co nevíme, co musíme rozhodnout — podklad pro dotazník a strategii | *Co si musíme ujasnit, než uděláme strategii?* |
| — | [Konkurence](konkurence.md) | ~40 produktů (CZ/SK, USA, UK, DACH, FR/NL, PL, AU, Asie, LatAm): funkce, unikáty, ceny; co z toho plyne | *Kdo to dělá a čím se lišíme?* |
| — | [Katalog služeb](sluzby-katalog.html) · [Cesta klienta](cesta-klienta.html) · [Co postavit](co-postavit.html) · [Sitemapa](sitemapa-sluzeb.html) | HTML přehledy: bloky služeb s inspirací z konkurence; 10 kroků cesty klienta; co ke kterému kroku postavit | *Co a v jakém pořadí stavíme?* |
| 08 | [Byznys a plán](08-byznys-a-plan.md) | Ceny, go-to-market, roadmapa, tým, rizika — plán, jak misi uskutečnit; bude se přepisovat ve strategii | *Jak a kdy to zpeněžíme?* |

## Zdroje, ze kterých to vzniklo

| Zdroj | Co obsahuje | Stav |
|---|---|---|
| `docs/archiv/Brokerly_master_dokument.docx` (5. 7. 2026) | **Hlavní zdroj pravdy.** 24 kapitol: produkt, byznys, trh, ceny, roadmapa, tým, celý datový model, automatizace, provozní detaily, pořadí stavby, KPI | Přečteno celé. Textová verze: `docs/master-dokument-2026-07.md` |
| `AGENTS.md` | Pravidla pro AI agenty: rozsah etapy 1, datový model, design systém, práce ve dvou | Přečteno |
| `README.md`, `docs/spoluprace.md` | Spuštění, synchronizace, onboarding kolegy | Přečteno |
| `docs/design-system.md`, `.design-sync/*` | Design systém a historie ladění palety | Přečteno |
| `docs/audit-2026-08-26.md` | Kritický audit kontaktů a nemovitostí — 24 bodů | Přečteno |
| `docs/superpowers/plans/…`, `docs/verification/…` | Plán a ověření redesignu detailu nemovitosti (25. 9.) | Přečteno |
| `docs/image-crop-uploader.md` | Technická specifikace nahrávání a ořezu fotek | Přečteno |
| `supabase/migrations/*` (15 souborů), `supabase/functions/*` | Skutečné schéma databáze a serverové funkce | Přečteno |
| `src/` (36 souborů, 14 700 řádků) | Kód aplikace — prošly se obrazovky, ne řádek po řádku | Prošlo se |
| Git historie (151 commitů, 5. 7.–28. 9. 2026) | Co se kdy stavělo a proč | Prošlo se |
| Paměť z předchozích Claude sessions (claude-mem, ruflo, memory) | Rozhodnutí a preference z práce od 16. 8. | Prošlo se |
| **Notion „Brokerly"** (Filipův workspace, 5 stránek) | Business plán, „Co bude aplikace umět", **procesy s konkrétními nástroji a pravidly**, ukázkový průchod hero tokem, tři patra CRM vs. stret.ai, 6 fází práce makléře, prodejní trychtýř | Přečteno celé 1. 10. (export). Kopie v `docs/notion-export-2026-10/`. Je to **předloha master dokumentu** — ten z něj vznikl; Notion má navíc konkrétní nástroje, pravidla a chytré detaily |
| `Checklist_stavby_CRM.xlsx` (zmíněn v master dokumentu, kap. 23) | 120 úkolů stavby s vysvětlením | **Nenalezen** v repu ani ve složce |

## Jak dokumenty číst

- **Fakta vs. stav.** Všechno z master dokumentu je uvedeno jako „co bylo
  rozhodnuto v červenci". Kde se od té doby realita posunula nebo odchýlila,
  je to označeno `► Stav 10/2026:`.
- **Statusy** u funkcí a úkolů: `hotovo` · `rozestavěno` · `plán` ·
  `odloženo` · `zamítnuto` · `?` (nevíme).
- Dokument 07 je nejdůležitější pro další krok — každá otázka v něm má
  odkaz na místo, kde rozpor vznikl.

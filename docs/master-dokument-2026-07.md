> **Textový převod `Brokerly_master_dokument.docx` (5. 7. 2026).** Automaticky převedeno 1. 10. 2026, aby šel dokument číst, hledat a porovnávat v gitu. Tabulky jsou rozpadlé na řádky (buňka pod buňkou) — pro přesné čtení tabulek použij původní Word. Obsahově je to zdroj pravdy pro [docs/projekt](projekt/00-mapa.md).

BROKERLY

Done-for-you AI back office a CRM pro realitní makléře

Kompletní produktový a technický dokument

Část A: produkt a byznys (kap. 1–13) · Část B: technická specifikace ke stavbě (kap. 14–24)

# Obsah

ČÁST A — PRODUKT A BYZNYS

1. Shrnutí produktu

2. Problém, který řešíme

3. Cílová skupina

4. Řešení a princip fungování

5. Obchodní model, produkty a ceny

6. Trh, konkurence a konkurenční výhoda

7. Go-to-market

8. Roadmapa a cíle 2026

9. Tým, role a pravidla

10. Životní cyklus realitního makléře

11. Mapa automatizace — co z procesu řešíme

12. Kvalifikace proti realitním turistům

13. Rizika a jak na ně

ČÁST B — TECHNICKÁ SPECIFIKACE

14. Co systém je a jak funguje (technická část)

15. Datový model — tabulky a pole

16. Propojení tabulek (vztahy)

17. Pohledy — jak se na data kouká

18. Automatizační vrstva — procesy nad tabulkami

19. Provozní detaily jednotlivých funkcí

20. Systémová pravidla

21. Pořadí stavby

22. KPI a metriky úspěchu

23. Detailní checklist stavby

24. Další kroky — čím začít

ČÁST A — PRODUKT A BYZNYS

# 1. Shrnutí produktu

Brokerly je done-for-you AI back office pro realitní makléře a kanceláře. Není to jen software ani kurz — je to služba: vybereme systém, nastavíme ho, napojíme automatizace a staráme se o jejich provoz. Běží jako produktová řada vedle agentury, žádná nová firma. Cílem je ušetřit makléři čas napříč celým jeho pracovním procesem a zajistit, aby mu žádný lead nepropadl.

Produkt stojí na jednoduchém principu: makléř většinou už nějaké CRM má. My ho nenutíme ho vyhazovat — necháme existující CRM jako sklad dat a nasadíme na něj automatizační vrstvu, která nad těmi daty sama jedná: odpovídá zájemcům, rezervuje prohlídky, připomíná, follow-upuje a reportuje. Tomu říkáme architektura hub-and-spoke.

Jednou větou: CRM je sklad dat o klientech a nemovitostech a naše automatizační vrstva je asistent, který nad těmi daty sám jedná — odpovídá, zapisuje, připomíná a plánuje za makléře.

Vedle automatizační služby produkt staví i vlastní jádro CRM přizpůsobené realitám, nejprve pro sólo makléře; kancelářský segment přijde v druhé fázi. Část B tohoto dokumentu je kompletní specifikace tohoto jádra.

# 2. Problém, který řešíme

Realitní makléř tráví velkou část dne opakovanou rutinou a přesto ztrácí obchody kvůli mezerám v procesu. Konkrétně:

- Ztrácí 20–30 % leadů pomalou reakcí na poptávky z portálů.

- Zapomíná na majitele, kteří chtějí prodat později, a na vlažné kontakty v CRM, které nikdo neobsluhuje.

- Má no-show na prohlídkách — jezdí na schůzky, které se nekonají, nebo na zájemce, kteří nemají jak koupit („realitní turisté“).

- Věnuje 1,5–2 hodiny denně administrativě (třídění pošty, zápisy, follow-upy); denně mu chodí desítky až stovky e-mailů, které nestíhá procházet.

Řešením je automatizovaný tok leadu — od okamžité odpovědi přes rezervaci a připomínky prohlídek až po dlouhodobý follow-up a péči o klienta — plus servisní vrstva, která to nastaví a provozuje.

# 3. Cílová skupina

Ideálním klientem je zkušený realitní makléř, který je v oboru zhruba 5 a více let. Délka praxe ale není rozhodující — rozhodující je vytíženost:

- Vysoký objem práce: ideálně 3 a více současně inzerovaných nemovitostí.

- Věková kategorie 25–50 let.

- Přichází o kontakty kupujících — lidé, kteří nemohli koupit danou nemovitost, ale dál hledají v lokalitě, mu vypadávají z evidence.

- Přichází o potenciální prodávající — majitele, kteří chtěli prodat „třeba za půl roku“, a nikdo jim to nepřipomněl.

- Nemá ucelený systém: informace jsou roztroušené, chybí přehled o tom, co se na které nemovitosti právě děje.

- Denně mu chodí desítky až stovky e-mailů, které nestíhá třídit.

Co mu prodáváme: úsporu desítek hodin měsíčně (zapisování, hledání informací, třídění pošty), všechno na jednom místě od A do Z s jasným přehledem — a hlavně to, aby v objemu práce nepřicházel o statisíce korun ušlého zisku z věcí, na které zapomněl nebo je nesjednal.

Sekundární segment (druhá fáze): realitní kanceláře s 5+ makléři — prodej vedení, argument je kontrola nad leady a výkonem (balík KANCELÁŘ).

# 4. Řešení a princip fungování

## 4.1 Hub-and-spoke architektura

- CRM = sklad dat. Databáze, kde leží všechno o leadech, nemovitostech a klientech (existující CRM makléře — stret.ai, Raynet, Tabidoo — nebo náš vlastní hub). Data uchovává a zobrazuje, ale sama od sebe nic nedělá.

- Automatizační vrstva = ruce, které jednají. Reaguje na data a koná: přijme poptávku, odpoví, zapíše lead, pošle připomínku, den po prohlídce se zeptá na dojem.

Přirovnání: CRM je kartotéka, automatizační vrstva je asistent, který ji obsluhuje. Kartotéka bez asistenta je jen složka papírů; asistent bez kartotéky neví, s kým mluví. Hodnota je v propojení.

Proč to takto: makléř nemusí měnit nástroje, pro nás je to menší závislost na jedné platformě, a hodnotu dodáváme tam, kde ji makléř nejvíc cítí — v jednání, ne v evidenci.

## 4.2 Hero funkce: speed-to-lead tok

Vstupní funkce, se kterou se jde na trh: jeden spojený řetězec od poptávky na portálu po zarezervovanou prohlídku v kalendáři makléře — okamžitá odpověď (do ~2 minut), kvalifikace, samoobslužná rezervace, SMS remindery a follow-up po prohlídce. Ukazuje hodnotu okamžitě a je to „tenká hrana“, na kterou se navěšuje všechno ostatní. Technický průběh je v kapitole 18.1, provozní detaily v kapitole 19.

# 5. Obchodní model, produkty a ceny

Produktová řada běží jako služba s jednorázovým nastavením (setup) a měsíčním provozem (maintenance).

Produkt

Co obsahuje

Cena

MAKLÉŘ

Poptávky + prohlídky + follow-up majitelů + digest + bonusy (recenze, výročí)

40K setup + 3,5K/měs

MAKLÉŘ+

Navíc matching databáze + monitoring soukromé inzerce + alert na expirace

55K setup + 4,5K/měs

KANCELÁŘ

Vše + distribuce leadů s eskalací + reporting vedení

90K setup + 9K/měs

Studio (za kus)

Virtual staging 400/foto, půdorys 1 200, vizualizace 600, popisky 300, balíček inzerát 3 500

dle kusu

Asistentka (později)

Chat/voice asistentka (od podzimu)

4–7K/měs

Ekonomika: náklad na klienta zhruba 2K setup a ~1K/měs (nástroje, API, SMS). Marže ~95 % na setupu a ~75 % na provozu. Nasazení po šablonizaci ~4 h/klient. Prodejní argument: jeden zachráněný obchod za půl roku (provize ~135K) zaplatí službu trojnásobně.

# 6. Trh, konkurence a konkurenční výhoda

Trh je vzdělaný (existují AI kurzy pro makléře, což potvrzuje poptávku), ale done-for-you segment je prázdný. Konkurence je bodová: stret.ai (AI-first CRM SaaS, 1,2–2K/měs), MyLeady (samoprodejci), Bezvabot (weboví chatboti), FluentCall (voice). Nikdo nedělá kompletní tok plus servis. Okno příležitosti je 12–24 měsíců, pak přijde komoditizace.

Hlavní referenční konkurent je stret.ai — AI CRM s příběhem „nemusíš ručně vyplňovat, ušetříme ti hodiny administrativy“. Umí AI asistenta s kontextem CRM, hlasové diktování, e-mailovou integraci, publikaci na portály a stahování poptávek.

## 6.1 V čem se odlišujeme

- Od „evidovat“ k „jednat za makléře“. Konkurence lead rychle zapíše, ale zpracovat ho musí makléř. My ho rovnou odbavíme.

- Dlouhodobý follow-up majitelů jako stroj. Největší nevyužitý poklad jsou vlažné a minulé kontakty. Automatizovat to skoro nikdo neumí — to je náš moat.

- Akvizice, ne jen příchozí leady. Monitoring samoprodejců a alert na expirované inzeráty = aktivní hledání zakázek.

- Kvalifikace proti realitním turistům. Prověření zájemce před prohlídkou, aby makléř nejezdil zbytečně.

- AI Studio. Staging, půdorysy, vizualizace, popisky — kreativní výstupy, které konkurence nemá.

- Distribuce a servisní vztah. Denní call-centrum, ~10 realitních klientů, brand v nice, bundle s contentem a Studiem. Moat = vztah a hloubka niky, ne technologie.

# 7. Go-to-market

- Cross-sell existujícím realitním klientům (nejteplejší leady).

- Integrace do denního call-centra jako druhý opener vedle contentu, s diagnostickými otázkami (reakční čas, no-show, ztracení majitelé).

- Case study content na vlastní profil (čísla v hooku) → inbound.

- Q4: outbound na kanceláře 5+ makléřů, prodej šéfovi (kontrola nad leady).

Vstupní (hero) funkcí, se kterou se jde na trh, je speed-to-lead tok.

# 8. Roadmapa a cíle 2026

Období

Co se děje

Červen

Validace na existujících callech (NEMO + 1 sólo makléř), build MVP o víkendech, pilot č. 1 za 20K + case study.

Červenec

Pilot č. 2 za plnou cenu, produktizace (ceník, PDF, SOP, smlouva s vymezením maintenance), Studio spuštěno okamžitě.

Srpen

Prodej — cross-sell + call-centrum, cíl 3–4 klienti.

Září–říjen

Šablonizace, monitoring chyb, delegace (Adéla admin, externí builder od 8 klientů).

Listopad–prosinec

Kancelářský segment (NEMO reference), voice pilot.

Cíl 31. 12. 2026

8–10 klientů ≈ 350–450K setup + 40–70K/měs MRR.

# 9. Tým, role a pravidla

Produkt staví dvoučlenný tým s jasně rozdělenými doménami:

- Filip — technický build. Automatizace (Make), AI prompty a logika kvalifikace, API napojení (CRM, Google Drive, kalendář, SMS), scraping infrastruktura, logika digestu.

- Kolega — data, design a Studio. Airtable struktura, šablony textů, vizuální podoba (HTML šablona digestu, PDF reporty pro vedení, Cal.com pod brandem klienta) a kompletní provoz AI Studia (objednávky, zpracování, dodání do 24 h).

- Později: Adéla na admin (září–říjen), externí builder od 8 klientů.

## 9.1 Pravidla provozu

- Call-centrum blok 8:45–11:00 je nedotknutelný; build probíhá večery a víkendy.

- Závazné kapacitní pořadí: Studio → automatizace → asistentka. Nikdy vše naráz.

# 10. Životní cyklus realitního makléře

Celý proces makléře od chvíle, kdy ještě nemá klienta, po dokončení obchodu. Klíčové: makléř neprodává nemovitosti — prodává službu zprostředkování; velká část práce je proto akvizice.

Fáze

Co obsahuje

Fáze 0 — Příprava

Kvalifikace a živnost, budování značky a webu, znalost lokálního trhu, nastavení nástrojů (CRM, inzerce, šablony).

Fáze 1 — Akvizice

Prospecting, práce s leady a lead magnety, monitoring samoprodejců, alert na expirované inzeráty, cold calling a oslovování, kvalifikace leadu.

Fáze 2 — Získání klienta

Úvodní konzultace, první schůzka u nemovitosti, cenová analýza, prezentace plánu, kontrola právního stavu, podpis zprostředkovatelské smlouvy.

Fáze 3 — Příprava a marketing

Sběr podkladů, home staging, focení/video/3D, tvorba inzerátu, microsite k nemovitosti, spuštění inzerce, vyhodnocování kanálů.

Fáze 4 — Práce se zájemci

Příjem a odpovídání na dotazy, kvalifikace zájemců, organizace a vedení prohlídek, reportování majiteli, vyjednávání, prověření financování.

Fáze 5 — Uzavření

Rezervační smlouva, kupní smlouva a úschova, hypotéka, podpis, návrh na vklad do katastru, vyplacení z úschovy.

Fáze 6 — Předání a dokončení

Předávací protokol a předání, přepis energií a SVJ, daňové povinnosti, žádost o recenzi, aftercare a doporučení.

# 11. Mapa automatizace — co z procesu řešíme

Mapování činností makléře na funkce systému. „V systému“ = plánovaná funkce; „Nový návrh“ = doplněk, který se snadno automatizuje; „—“ = lidská práce, kterou neautomatizujeme.

Fáze

Činnost makléře

Naše řešení

Stav

1 Akvizice

Vyhledávání samoprodejců

Monitoring a scraping soukromé inzerce (Bazoš, Sreality)

V systému

1 Akvizice

Neúspěšně prodávané nemovitosti

Alert na expirované inzeráty (60+ dní)

V systému

1 Akvizice

Oslovování majitelů

AI příprava personalizovaného oslovení

Nový návrh

2 Získání klienta

Cenová analýza

Automatická cenová analýza vůči trhu

Nový návrh

2 Získání klienta

Kontrola právního stavu

Automatický sběr podkladů (LV, PENB) – Google Disk

V systému

2 Získání klienta

Zprostředkovatelská smlouva

Generování / předvyplnění smlouvy + e-podpis

Nový návrh

3 Marketing

Home staging

Virtual staging (AI Studio)

V systému

3 Marketing

Půdorys

Generování 2D/3D půdorysů

V systému

3 Marketing

Inzerát

AI generování popisků + překlady

V systému

3 Marketing

Prezentace nemovitosti

Auto-generování microsite

Nový návrh

3 Marketing

Spuštění inzerce

Auto-publikace na servery a sítě

Nový návrh

4 Zájemci

Odpovídání na dotazy

Okamžitá automatická odpověď + AI chatbot

V systému

4 Zájemci

Kvalifikace zájemců

Automatická kvalifikace poptávek

V systému

4 Zájemci

Zápis leadu

Automatický zápis do CRM / tabulek

V systému

4 Zájemci

Třídění pošty

Automatická triáž e-mailové schránky

V systému

4 Zájemci

Organizace prohlídek

Samoobslužná rezervace přes kalendář

V systému

4 Zájemci

Prevence no-show

SMS remindery 24 h a 2 h předem

V systému

4 Zájemci

Zpětná vazba po prohlídce

Automatický follow-up + značkování horkých

V systému

4 Zájemci

Neúspěšní zájemci

Automatické párování s novými inzeráty (matching)

V systému

4 Zájemci

Report majiteli

Automatický report o průběhu prodeje

Nový návrh

5 Uzavření

Rezervační smlouva

Generování z dat leadu

Nový návrh

5 Uzavření

Vklad do katastru

Hlídání lhůt + notifikace stavu

Nový návrh

6 Dokončení

Předání nemovitosti

Generování protokolu + zápis měřidel

Nový návrh

6 Dokončení

Recenze

Automatická žádost o Google recenzi

V systému

6 Dokončení

Aftercare

Výroční zprávy + dotazy na doporučení

V systému

Průřezově

Denní organizace

Ranní e-mailový digest

V systému

Průřezově

Péče o majitele

Dlouhodobý follow-up majitelů + reporty

V systému

# 12. Kvalifikace proti realitním turistům

Rozšíření hero funkce, které makléři ušetří zbytečné cesty na prohlídky. Hovor je tření a může odradit i vážné zájemce, proto patří až po projeveném zájmu (po rezervaci), ne jako bariéra na vstupu.

- Spouštěč: až po rezervaci prohlídky se spustí telefonní nebo SMS dokvalifikace.

- Otázky: financování (hotovost/hypotéka), zda musí nejdřív prodat vlastní, timing, potvrzení termínu.

- Skóre a roztřídění: zelený (vážný) / žlutý (nejasný) / červený (turista — makléř na fyzickou prohlídku nejede; nabídne se online prohlídka nebo dlouhodobý follow-up).

- Eskalace: nestandardní odpověď se předá makléři.

Levnější mezikrok před plným hlasem: SMS/WhatsApp dokvalifikace — odfiltruje dost turistů skoro zadarmo a bez rizika trapného hovoru. Hlasová asistentka je „přidáme příště“, ne hero funkce. Telefonní číslo pro odchozí kvalifikaci je jen tehdy, když ho zájemce uvedl — počítat s fallbackem. Ochrana kalendáře už v základním toku: rezervační link dostávají jen leady kvalifikované jako A nebo B (viz 19.1).

# 13. Rizika a jak na ně

- Komoditizace. Portály/CRM si můžou přidat auto-odpovědi. Řešení: prodávat servis a výsledek, ne scénář; jádro hodnoty ve follow-upu majitelů a kancelářské vrstvě; zvážit partnerství se stret.ai jako implementátor.

- Platformové riziko. Nestavět na jedné automatizaci; vstup přes e-mail, ne scrapování portálových poptávek.

- Kvalita AI a důvěra. Eskalace na člověka od první verze; AI odpovídá jen z karty nemovitosti; konzervativní triáž (nejistota = notifikace, nikdy spam).

- Právní šedá zóna akvizice. Systém nikdy sám neoslovuje soukromé inzerenty — jen ukazuje seznam, volá makléř. Smluvní klauzule: kontaktování je odpovědnost klienta. Interně vedeno jako „data servis“, ne outreach.

- Kapacita. Závazné pořadí: Studio → automatizace → asistentka; nikdy vše naráz.

ČÁST B — TECHNICKÁ SPECIFIKACE

Podle této části lze systém sestavit bez dalších podkladů. Verze: fundament v1 + revizní doplňky. Rozsah prvního běhu: sólo makléř, byt + dům, prodej. Bloky pozemek / komerční / pronájem a kancelářská pole zůstávají ve specifikaci, ale v prvním běhu se nevyplňují.

# 14. Co systém je a jak funguje (technická část)

Brokerly je CRM + automatizační vrstva pro realitní makléře, architektura hub-and-spoke:

- CRM (sklad dat): 5 tabulek — Kontakt, Nemovitost, Deal, Aktivita + konfigurace Nastavení. Drží všechna data a jejich propojení. Samo nic nedělá.

- Automatizační vrstva (ruce): procesy, které nad tabulkami jednají — přijmou poptávku, odpoví, zapíšou, rezervují, připomenou, follow-upují. Každá automatizace jen čte a zapisuje do tabulek; proto se tabulky staví první.

Základní jednotka práce je Deal: jeden zájemce o jednu nemovitost. Deal je most — spojuje člověka (kdo) s nemovitostí (co) a prochází fázemi od leadu po podpis.

# 15. Datový model — tabulky a pole

Legenda: „ano*“ = stačí jedno z označených polí. „ano†“ = povinné jen pro daný druh/roli. Odkaz → X = propojovací pole na tabulku X. Pole označená (DOPLNIT) ve fundamentu zatím nejsou a mají se přidat.

## 15.1 Tabulka KONTAKT — člověk

Jedna karta na osobu, i když má víc rolí (kupující i vlastník zároveň). Identita se pozná podle telefonu nebo e-mailu — před založením se vždy hledá shoda, aby nevznikly dvě karty téhož člověka.

Postup vyplnění: najdi/založ podle telefonu → doplň kontakt → role, zdroj, stav → u kupujícího vyplň blok CO HLEDÁ.

### Blok: Základ

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

1

Jméno a příjmení

text

ano

—

Identifikace osoby.

2

Telefon

text

ano*

—

Stačí telefon nebo e-mail. Primární klíč deduplikace.

3

E-mail

text

ano*

—

Druhý klíč deduplikace.

4

Role

výběr (víc)

ano

kupující; vlastník; protistrana; doporučitel

Čím osoba je; může mít víc rolí zároveň.

5

Odkud přišel

výběr

ano

Sreality; iDNES; web; doporučení; cold call; monitoring; osobní

Který kanál nosí lidi (ROI zdrojů).

6

Stav

výběr

ano

nový; kontaktovaný; kvalifikovaný; klient; ztracený

Fáze vztahu; nikdy nesmí být prázdná.

7

Teplota (skóre)

výběr

ne

horký; vlažný; studený

Komu volat první.

8

Poznámka

delší text

ne

—

Cokoli navíc.

9

Vznik karty

datum

ano (auto)

—

Automaticky; hlídání dlouho neoslovených.

### Blok: Co hledá — poptávkový profil (jen role kupující)

Pohání matching (párování nové nabídky na zájemce) a dlouhodobý follow-up kupujících.

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

10

Hledá: transakce

výběr

ano†

koupě; pronájem

†Povinné u role kupující. Nejtvrdší filtr párování.

11

Hledá: druh

výběr (víc)

ne

byt; dům; pozemek; komerční

Co ho zajímá; může víc druhů.

12

Hledá: lokalita

text (víc)

ne

—

Čtvrti/města; klíč pro párování.

13

Hledá: dispozice

výběr (víc)

ne

1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+ a více

Rozsah velikosti.

14

Rozpočet od

číslo

ne

—

Spodní hranice ceny/nájmu.

15

Rozpočet do

číslo

ne

—

Horní hranice — hlavní filtr matchingu.

16

Účel

výběr

ne

vlastní bydlení; investice; rekreace; jiné

Tón nabídek a kvalifikace.

17

Aktivně hledá do

datum

ne

—

Dokdy řeší koupi (nurture kupujících).

### Blok: Souhlas (DOPLNIT — ve fundamentu zatím chybí)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

18

Souhlas GDPR

ano-ne

ne

ano; ne

Souhlas se zpracováním osobních údajů.

19

Datum souhlasu

datum

ne

—

Kdy byl souhlas udělen (doložitelnost).

20

Zdroj souhlasu

výběr

ne

poptávka z portálu; formulář; osobně; e-mail

Odkud souhlas pochází.

## 15.2 Tabulka NEMOVITOST — co se prodává / pronajímá

Rozvětvená podle druhu: společná pole platí vždy, pak se vyplní JEN blok odpovídající druhu (byt / dům / pozemek / komerční); u pronájmu navíc blok Pronájem. Pole „Co je v ceně / fakta pro odpovědi“ a „Možný termín předání“ jsou zdroj, ze kterého AI odpovídá zájemcům — a mimo něj nehádá.

Postup vyplnění: vyber Druh → společná pole (+ co je v ceně, termín předání) → JEN blok svého druhu → u pronájmu blok Pronájem.

### Blok: Společná pole (platí pro každou nemovitost)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

1

Vlastník

odkaz → Kontakt

ano

—

Kdo nemovitost nabízí.

2

Druh

výběr

ano

byt; dům; pozemek; komerční; garáž/ostatní

Řídí, který blok polí se vyplní.

3

Transakce

výběr

ano

prodej; pronájem

Prodej, nebo pronájem.

4

Adresa

text

ano

—

Ulice, město, PSČ, katastrální území, lokalita.

5

Stav nabídky

výběr

ano

akvizice; prodá později; příprava; v nabídce; rezervováno; uzavřeno; staženo

Kde je nemovitost v procesu.

6

Cena / nájem

číslo

ano

—

Prodej = kupní cena; pronájem = měsíční nájem.

7

Co je v ceně / fakta pro odpovědi

delší text

ne

—

Nejčastější dotazy: součásti ceny, vybavení, sklep, sítě, sousedství. Jediný zdroj věcných AI odpovědí.

8

Možný termín předání

text

ne

—

Odkdy volné / kdy lze předat. Druhý nejčastější dotaz.

9

ID inzerátu

text

ne

—

Párování příchozí poptávky se správnou nemovitostí.

10

Fotky / dokumenty

přílohy

ne

—

LV, PENB, půdorys, fotky.

### Blok: Jen pro BYT (povinná pole platí při Druh = byt)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

11

Dispozice

výběr

ano†

1+kk; 2+kk; 2+1; 3+kk; 3+1; 4+kk; 4+1; 5 a více

Velikost bytu.

12

Užitná plocha (m²)

číslo

ano†

—

Kolik metrů.

13

Patro / z pater

text

ne

—

Např. 3. z 5.

14

Vlastnictví

výběr

ne

osobní; družstevní; SVJ

Typ vlastnictví.

15

Konstrukce

výběr

ne

cihla; panel; jiné

Materiál domu.

16

Stav bytu

výběr

ne

novostavba; po rekonstrukci; dobrý; před rekonstrukcí

—

17

Výtah / balkon / sklep

ano-ne (víc)

ne

výtah; balkon/lodžie; terasa; sklep

Co k bytu patří.

18

PENB

výběr

ne

A–G

Energetický štítek.

### Blok: Jen pro DŮM (povinná pole platí při Druh = dům)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

19

Dispozice / místnosti

výběr

ano†

2+kk; 3+kk; 4+kk; 5+kk; 6 a více

—

20

Užitná plocha (m²)

číslo

ano†

—

Obytná plocha domu.

21

Plocha pozemku (m²)

číslo

ano†

—

Velikost parcely.

22

Typ domu

výběr

ne

samostatný; řadový; dvojdomek

—

23

Počet podlaží

číslo

ne

—

—

24

Garáž / zahrada / bazén

ano-ne (víc)

ne

garáž; zahrada; bazén

Co k domu patří.

25

Stav domu

výběr

ne

novostavba; po rekonstrukci; dobrý; před rekonstrukcí

—

26

PENB

výběr

ne

A–G

—

### Blok: Jen pro POZEMEK — v prvním běhu se nevyplňuje (nemazat)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

27

Výměra (m²)

číslo

ano†

—

†Při Druh = pozemek.

28

Druh pozemku

výběr

ano†

stavební; zahrada; zemědělský; les; ostatní

Nejdůležitější údaj pozemku.

29

Zasíťování

ano-ne (víc)

ne

voda; elektřina; plyn; kanalizace

Inženýrské sítě.

30

Územní plán

výběr

ne

zastavitelný; nezastavitelný; nezjištěno

Smí se stavět?

31

Přístup

výběr

ne

zpevněná cesta; nezpevněná; přes cizí pozemek

Přístup k parcele.

32

Šířka / tvar / svažitost

text

ne

—

Poznámky k parcele.

### Blok: Jen pro KOMERČNÍ — v prvním běhu se nevyplňuje (nemazat)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

33

Podtyp

výběr

ano†

kancelář; obchod/prodejna; sklad; výroba; restaurace; jiné

†Při Druh = komerční.

34

Podlahová plocha (m²)

číslo

ano†

—

Provozní plocha.

35

Stav / vybavenost

výběr

ne

holoprostor; standard; plně vybaveno

Stav předání.

36

Parkování / vjezd

výběr

ne

ne; parkovací stání; nákladní vjezd; rampa

Logistika objektu.

37

PENB

výběr

ne

A–G

—

### Blok: Jen pro PRONÁJEM (při Transakce = pronájem) — v prvním běhu se nevyplňuje (nemazat)

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

38

Kauce

číslo

ne

—

Obvykle 1–3× nájem.

39

Poplatky / služby

číslo

ne

—

Kolik měsíčně navíc.

40

Doba nájmu

výběr

ne

určitá; neurčitá

—

41

Dostupné od

datum

ne

—

Odkdy k nastěhování.

42

Vybavení

výběr

ne

vybaveno; částečně; nevybaveno

—

## 15.3 Tabulka DEAL — jeden obchod

Jeden zájemce o jednu konkrétní nemovitost = jeden Deal. Tentýž člověk se zájmem o dvě nemovitosti má dva Dealy. Deal prochází fázemi (sloupce kanbanu) a nese kvalifikaci, peníze a další krok.

Postup: vznik = lead → kvalifikace (teplota, financování) → prohlídka → nabídka → rezervace → podpis.

### Blok: Základ — kdo, co, kde v procesu

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

1

Kupující / zájemce

odkaz → Kontakt

ano

—

Kdo má zájem.

2

Nemovitost

odkaz → Nemovitost

ne*

—

*Páruje se automaticky dle ID inzerátu; doplní se, jakmile je známa.

3

Název obchodu

text

ano (auto)

—

Automaticky: jméno + nemovitost (např. „Veselá — Bory 3+kk“).

4

Fáze

výběr

ano

lead; kontaktován; kvalifikován; prohlídka; nabídka; rezervace; podpis; prohráno

Sloupce kanbanu.

5

Výsledek

výběr

ano

otevřený; vyhraný; prohraný

Běží / vyhrál / padl.

### Blok: Kvalifikace — je to vážný zájemce?

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

6

Teplota (skóre)

výběr

ne

horký (A); vlažný (B); studený (C)

Vážnost zájmu o tuto nemovitost.

7

Financování

výběr

ne

hotovost; hypotéka schválená; hypotéka v řešení; neřešeno

Jak zaplatí.

8

Musí nejdřív prodat

ano-ne

ne

ano; ne

Závislost na prodeji vlastní nemovitosti.

9

Termín stěhování

výběr

ne

do 1 měsíce; do 3 měsíců; do 6 měsíců; nespěchá

Jak rychle potřebuje.

### Blok: Peníze a další krok

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

10

Hodnota

číslo

ne

—

Cena nemovitosti nebo očekávaná provize.

11

Další krok

text

ne

—

Nejbližší akce (zobrazená na kartičce kanbanu).

12

Termín dalšího kroku

datum

ne

—

Kdy se má stát.

### Blok: Časy a prohra

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

13

Vznik obchodu

datum

ano (auto)

—

Automaticky při založení.

14

Očekávané uzavření

datum

ne

—

Odhad podpisu.

15

Datum uzavření

datum

ne

—

Reálné uzavření.

16

Důvod prohry

výběr

ne

cena; financování; koupil jinde; rozmyslel si; nedostupné; jiné

Učení z proher.

17

Přiřazený makléř

odkaz → tým

ne

—

Jen kancelářský balík; v prvním běhu prázdné.

## 15.4 Tabulka AKTIVITA — historie + připomínky

Dvě funkce v jedné tabulce: (a) záznam minulosti — proběhlý hovor, e-mail, prohlídka; (b) připomínka do budoucna — zavolat ve čtvrtek, follow-up po prohlídce. Rozlišuje je pole „Je to připomínka?“ a „Kdy“. Follow-up je jen aktivita typu připomínka s datem. Z aktivit se skládá timeline u kontaktu i u dealu.

Postup: typ → koho se týká → Kdy → připomínka ano/ne → po splnění odškrtnout Hotovo.

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

1

Typ

výběr

ano

hovor; e-mail; SMS; schůzka; prohlídka; poznámka; PŘIPOMÍNKA; follow-up

Připomínka a follow-up míří do budoucna, zbytek je záznam.

2

Text / obsah

delší text

ano

—

Co se stalo / co se má udělat.

3

Kontakt

odkaz → Kontakt

ano

—

Koho se týká; objeví se v jeho timeline.

4

Obchod (deal)

odkaz → Deal

ne

—

Volitelně ke kterému obchodu patří.

5

Kdy (datum a čas)

datetime

ano

—

U záznamu = kdy se stalo; u připomínky = kdy upozornit.

6

Je to připomínka?

ano-ne

ano

ano; ne

Ano = hlídá se a vyskočí; ne = jen zápis historie.

7

Hotovo

ano-ne

ne

ano; ne

Odškrtnutí splněné připomínky.

8

Směr

výběr

ne

příchozí; odchozí

U hovoru / e-mailu / SMS.

9

Výsledek follow-upu

výběr

ne

vážný zájem; zvažuje; nezaujalo; nedovolal jsem se

Po prohlídce — kam obchod posunout.

10

Kdo (makléř)

text

ne

—

Jen kancelář; v prvním běhu prázdné.

## 15.5 NASTAVENÍ — profil makléře (konfigurace)

Není to tabulka se záznamy, ale jedno nastavení na makléře. Z něj čerpá speed-to-lead: jakým hlasem AI píše, čím se podepisuje, kdy eskaluje. Bez vyplněného Nastavení se hero tok nespouští.

### Blok: Identita odesílatele

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

1

Jméno makléře

text

ano

—

Kdo se pod odpovědi podepisuje.

2

Telefon odesílatele

text

ano

—

Do podpisu a SMS.

3

E-mail odesílatele

text

ano

—

Ze kterého se odpovídá.

4

Podpis

delší text

ano

—

Patička e-mailu (jméno, RK, telefon, web).

### Blok: Hlas — jak má AI psát

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

5

Oslovení

výběr

ano

tykání; vykání

Jak oslovovat zájemce.

6

Tón

výběr

ano

přátelský; věcný; formální

Styl odpovědí.

7

Ukázky mých odpovědí

delší text

ne

—

2–3 reálné e-maily; AI se učí styl.

8

Jazyky

výběr (víc)

ne

CZ; EN; DE; UA

Do jakých jazyků odpovídat/překládat.

### Blok: Pravidla

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

9

Reakční limit (speed-to-lead)

číslo (min)

ano

—

Do kolika minut odpovědět (cíl 2).

10

Pravidlo eskalace

delší text

ano

—

Kdy AI nehádá a předá makléři (neznámý/citlivý dotaz).

11

Pracovní doba

text

ne

—

Kdy nabízet termíny prohlídek.

12

Kvalifikační otázky

delší text

ne

—

Které otázky AI klade (financování, termín, účel).

### Blok: Kancelář — jen balík KANCELÁŘ, v prvním běhu se nevyplňuje

#

Pole

Typ

Povinné

Možnosti / číselník

K čemu slouží

13

Pravidlo přiřazení leadu

výběr

ne

rotace; podle lokality; podle vytížení

Rozdělování leadů mezi makléře.

14

Eskalace při nereakci (min)

číslo

ne

—

Za jak dlouho lead přehodit dalšímu (např. 15).

15

Příjemce reportu

text

ne

—

Komu chodí týdenní přehled výkonu.

# 16. Propojení tabulek (vztahy)

Vazby dělají z tabulek systém: po propojení se na kartě člověka objeví jeho obchody a historie, na kartě nemovitosti všichni zájemci.

Propojení

Kolik ku kolika

Význam

Co díky tomu vidíš

Kontakt → Deal

1 : N

Jeden člověk může mít víc obchodů.

Na kartě člověka všechny jeho obchody.

Nemovitost → Deal

1 : N

Na jednu nemovitost míří víc zájemců.

Na kartě nemovitosti seznam zájemců a jejich fází.

Kontakt → Nemovitost

1 : N

Jeden vlastník může mít víc nemovitostí.

U vlastníka všechny jeho nabídky.

Kontakt → Aktivita

1 : N

Ke člověku patří historie a připomínky.

Timeline u osoby.

Deal → Aktivita

1 : N

K obchodu patří historie a připomínky.

Timeline u obchodu.

Deal = most

—

Deal spojuje člověka (kdo) s nemovitostí (co).

Srdce systému; přes Deal se potkává poptávka s nabídkou.

Co hledá ↔ Nemovitost

logická vazba

Poptávkový profil kupujícího se páruje na nabídku.

Matching: nová nemovitost → seznam sedících zájemců.

### Minimum pro založení záznamu

Tabulka

Nutná pole při založení

Zbytek

Kontakt

jméno + (telefon nebo e-mail) + role + zdroj + stav

doplní se později

Nemovitost

vlastník + druh + transakce + adresa + stav nabídky + cena + povinná pole daného druhu

ostatní dle typu

Deal

kupující + fáze + výsledek

financování, hodnota, další krok

Aktivita

typ + text + kontakt + Kdy (+ je to připomínka?)

směr, výsledek

### Pravidla identity a deduplikace

- Před založením Kontaktu se vždy hledá shoda podle telefonu, pak podle e-mailu. Shoda = použije se existující karta (doplní se role), ne nová.

- Jedna osoba smí mít víc rolí zároveň (kupující i vlastník) — nikdy se nezakládá druhá karta.

- Poptávka z portálu se páruje na Nemovitost podle pole ID inzerátu; když se nespáruje, Deal vznikne bez nemovitosti a označí se k ručnímu doplnění.

# 17. Pohledy — jak se na data kouká

Pohled nepřidává data; zobrazuje tatáž data užitečně. Denní jádro tvoří čtyři pohledy:

Pohled

Z čeho

Jak je postavený

K čemu slouží

Kanban obchodů

Deal

Sloupce = hodnoty pole Fáze; kartička nese název, teplotu, financování, další krok + termín. Přetažení kartičky = změna fáze.

Denní přehled, kde co stojí.

Karta kontaktu

Kontakt + Deal + Aktivita

Detail osoby: pole + navázané obchody + timeline aktivit seřazená od nejnovější.

Před hovorem vidět všechno.

Karta nemovitosti

Nemovitost + Deal

Detail nabídky: pole + seznam zájemců (Dealů) s fázemi a teplotou.

Přehled zájmu o nabídku.

Dnešní připomínky

Aktivita

Filtr: Je to připomínka = ano, Hotovo = ne, Kdy ≤ dnes. Řazení dle Kdy.

Denní to-do; nic nepropadne.

# 18. Automatizační vrstva — procesy nad tabulkami

Každý proces je popsán spouštěčem, kroky, a tím, odkud čte a kam zapisuje. Vstupním kanálem z portálů je vždy e-mail (portály nemají API pro výdej poptávek); výstupy jsou e-mail, kalendář a SMS.

## 18.1 Hero tok: speed-to-lead (poptávka → rezervovaná prohlídka)

Krok

Co se stane

Čte z / zapisuje do

1. Příchod poptávky

Zájemce napíše přes portál; portál pošle notifikační e-mail, přesměrovaný na jedno sběrné místo.

vstup: e-mail

2. Parsování + zápis

Z e-mailu se vytáhne jméno, telefon, e-mail, ID inzerátu, dotaz. Deduplikace dle telefonu/e-mailu; založí se/aktualizuje Kontakt (role kupující, zdroj dle portálu, stav nový) a založí Deal (fáze lead), spáruje se s Nemovitostí dle ID inzerátu. Zapíše se Aktivita (typ e-mail, směr příchozí).

zapisuje: Kontakt, Deal, Aktivita

3. Složení odpovědi (do ~2 min)

AI sestaví odpověď JEN z polí Nemovitosti („Co je v ceně / fakta“, „termín předání“, parametry druhu) a z Nastavení (tón, oslovení, podpis). Když odpověď v datech není → eskalace (18.2).

čte: Nemovitost, Nastavení

4. Odeslání + kvalifikace

Odpověď odejde jménem makléře s rezervačním odkazem a kvalifikačními otázkami z Nastavení (financování, termín). Zapíše se Aktivita (e-mail, odchozí).

zapisuje: Aktivita; výstup: e-mail

5. Rezervace termínu

Zájemce vybere volný slot v kalendáři makléře; slot se zablokuje. Deal → fáze rezervace/prohlídka; odpovědi na otázky se zapíší do polí kvalifikace Dealu (financování, termín stěhování).

zapisuje: Deal; výstup: kalendář

6. Notifikace makléři

Makléři odejde SMS/zpráva: kdo, jaká nemovitost, kdy, financování.

čte: Deal; výstup: SMS

7. Remindery (no-show)

SMS zájemci 24 h a 2 h před prohlídkou s potvrzením/zrušením. Zrušení → slot se uvolní, Deal se vrátí do kvalifikován, makléři jde upozornění.

čte: Deal; zapisuje: Deal, Aktivita; výstup: SMS

8. Follow-up po prohlídce

Den po prohlídce se založí Aktivita typu follow-up; zájemci odejde dotaz na dojem (vážný zájem / zvažuji / nezaujalo). Vážný zájem → Deal teplota horký + upozornění makléři. Nezaujalo → Deal prohraný (důvod), kontakt zůstává v matchingu díky bloku Co hledá.

zapisuje: Aktivita, Deal; výstup: e-mail/SMS

## 18.2 Eskalace na člověka (běží napříč od první verze)

- Spouští se, když: dotaz nemá odpověď v polích Nemovitosti; dotaz je citlivý/právní; zájemce je nespokojený; cokoli mimo scénář.

- Chování: AI nehádá — odpoví, že se ozve makléř; založí Aktivitu-připomínku „lead čeká na člověka“ na Kontakt/Deal a pošle makléři upozornění.

- Pravidlo eskalace je textově definované v Nastavení (pole 10) a jde upravit bez zásahu do systému.

## 18.3 Matching (později — navrch)

- Spouštěč: nová Nemovitost se stavem „v nabídce“.

- Logika: projdou se Kontakty s rolí kupující; filtr transakce → druh → lokalita → rozpočet od–do → dispozice. Shoda = návrh nabídky.

- Akce: sedícím zájemcům odejde nabídka (tónem makléře); založí se Deal (fáze lead) a Aktivita.

## 18.4 Dlouhodobý follow-up majitelů (později — navrch)

- Zdroj: Nemovitosti se stavem „prodá později“ / Kontakty-vlastníci bez aktivní nabídky.

- Akce: pravidelné cenové zprávy o lokalitě; Aktivita-připomínka makléři ozvat se ve správný čas.

## 18.5 Denní přehled (později — navrch)

- Každé ráno souhrn: dnešní prohlídky (Dealy s termínem), nové leady čekající na reakci, dnešní připomínky (Aktivita). Jen čte, nic nezapisuje.

# 19. Provozní detaily jednotlivých funkcí

Doplnění kapitoly 18 o provozní úroveň: jak přesně jednotlivé funkce fungují, jaká mají pravidla, co je k nim potřeba od makléře a do kterého balíku patří.

## 19.1 Poptávky: kvalifikační logika A / B / C

Vstup poptávek: makléř si nastaví přeposílání portálových e-mailů na aliasový e-mail (např. makler@brokerly.cz), nebo filtr ve své schránce (od noreply portálu → forward). Nastavíme při onboardingu (~20 minut po vzdálené ploše).

Odpověď obsahuje kvalifikační otázky (financování, termín, účel). Podle reakce zájemce se lead třídí:

Stav

Kdy

Co se stane

A — kvalitní

Konkrétní odpověď na financování + termín

SMS makléři, rezervační link, priorita.

B — nejasný

Vyhýbavá / částečná odpověď

Jde do ranního digestu; rezervační link dostává.

C — studený

Nereaguje vůbec

Bez rezervačního linku (jen „děkujeme, ozveme se“); do databáze pro pozdější matching.

- Bez odpovědi do 24 h → automatický druhý dotaz.

- Rezervační link dostávají jen leady A a B — ochrana kalendáře makléře před zvědavci.

- Od makléře potřebujeme: nastavené přeposílání, 3 ukázky jeho odpovědí (AI z nich odvodí tón), podpis, telefon pro notifikace. Balík MAKLÉŘ.

## 19.2 Triáž e-mailové schránky

- Napojení schránky (Gmail/Outlook) přes OAuth. Každý nový e-mail se klasifikuje: POPTÁVKA / AKTIVNÍ OBCHOD (klient, advokát, banka, katastr) / ÚŘADY A FAKTURY / NEWSLETTER.

- POPTÁVKA jde do toku 18.1. AKTIVNÍ OBCHOD → okamžitá SMS se shrnutím v jedné větě. Ostatní do ranního digestu.

- Konzervativní pravidlo: když si AI není jistá → vždy AKTIVNÍ OBCHOD (notifikace), nikdy spam. Falešně odložený klient = ztracená důvěra v celý systém.

- Důvěra: „data zůstávají ve vaší schránce, AI je jen čte, neukládá“ + zpracovatelská smlouva. Balík MAKLÉŘ.

## 19.3 Sběr podkladů od majitelů (Google Drive)

- Po podpisu zprostředkovatelské smlouvy makléř u nemovitosti zaškrtne, co potřebuje (LV, PENB, fotky, půdorys…).

- Majiteli odejde e-mail s checklistem a odkazem pro nahrání (sdílená složka na Drive makléře — kvůli GDPR vždy makléřův, ne náš).

- Každé 3 dny automatická urgence na to, co chybí. Po nahrání notifikace makléři + AI kontrola, že dokument dává smysl (není prázdná stránka).

- Hodnota: reálně zkracuje obchod o 2–4 týdny — ukazovat v demu, má wow efekt. Balík MAKLÉŘ.

## 19.4 Akvizice: monitoring a expirace

- Denní monitoring inzerátů bez RK v regionu klienta (Sreality, Bazoš) → nové inzeráty s kontaktem do databáze klienta → ráno v digestu („noví majitelé v regionu: 7“).

- Právní pravidlo: systém NIKDY sám nerozesílá zprávy majitelům. Jen ukazuje seznam; volá makléř. Smluvně: kontaktování je odpovědnost klienta. Interně „data servis“, ne outreach.

- Expirované inzeráty: 60+ dní bez prodeje a bez RK → alert do digestu (frustrovaný majitel = otevřenější makléři). Datum prvního výskytu si vedeme sami (portál ho při editaci ceny mění) — vyžaduje denní snapshot. Balík MAKLÉŘ+.

## 19.5 Dlouhodobý follow-up majitelů

Majitel řekne „ozvěte se za 6 měsíců“. Makléř zadá 4 pole (jméno, telefon, datum návratu, lokalita) a zbytek běží sám:

Kdy

Co se stane

D+0

Poděkování za schůzku.

Každý 1. v měsíci

E-mail „vývoj cen ve vaší lokalitě“ — automaticky z tržních dat (průměrná cena za m², počet prodaných za 90 dní).

D-day −7

Úkol makléři v digestu: „tento týden volat“.

D-day

SMS upomínka makléři + souhrn historie kontaktů.

- Hodnota: jeden vrácený majitel = 100K+ provize. Nejsilnější prodejní argument akviziční vrstvy. Balík MAKLÉŘ.

## 19.6 AI Studio — servisní produkt

Čistě servisní tok (objednávka → zpracování → dodání do 24 h), žádný build automatizací. Objednávka v portálu, výsledky na sdílený Drive.

Výstup

Cena

Náklad

Marže

Poznámka

2D/3D půdorys (ze scanu telefonem)

1 200 Kč

~150 Kč

~87 %

Alternativa pro nescanující: ruční překreslení z fotky/náčrtu.

Virtual staging

400 Kč/foto

~30 Kč

~92 %

2–4 varianty stylu + retuš; vždy disclaimer „virtuálně zařízeno pro ilustraci“.

Renovační vizualizace

600 Kč/foto

~50 Kč

~92 %

Fotka starého bytu + zadání → „po rekonstrukci“.

Popisek inzerátu + překlady

300 Kč

&lt;10 Kč

~97 %

3 varianty (krátká/emoční/věcná), EN/DE/UA.

Balíček „inzerát komplet“

3 500 Kč

—

—

5× staging + půdorys + popis CZ/EN. Prodejní priorita — nejvyšší ticket, jeden tok.

## 19.7 Recenze a výroční péče

- 7 dní po předání → e-mail kupujícímu (spokojenost / co zlepšit / dáte recenzi?) → při „ano“ přímý link na Google recenzi (Place ID makléře se zjistí při onboardingu). Makléři s 50+ recenzemi vyhrávají lokální vyhledávání.

- Rok po předání → výroční e-mail („rok ve vašem novém bytě“) + jemná žádost o doporučení s formulářem. Bonusy balíku MAKLÉŘ.

## 19.8 Ranní digest — tvář produktu

- Každý den 7:30. Struktura: 1) tři priority dne, 2) noví leady se skóre, 3) dnešní prohlídky, 4) majitelé k oslovení, 5) věci z inboxu vyžadující pozornost.

- Osobní tón asistentky: oslovuje křestním jménem, zmiňuje včerejšek. Do designu a tónu investovat — klient kvůli digestu platí maintenance.

## 19.9 Kancelářská vrstva (balík KANCELÁŘ)

- Distribuce leadů s eskalací: lead → přiřazení makléři (rotace nebo lokalita) → 15 minut na převzetí kliknutím → bez převzetí jde dalšímu → po třetí eskalaci řediteli. Hodnotová špička balíku.

- Reporting vedení: každé pondělí 6:00 PDF řediteli — reakční časy per makléř, počty poptávek, rezervované prohlídky, uzavřené obchody, červeně podvýkonní (reakce &gt; 30 min), top makléři. Vizuál musí působit seriózně — to vedení kupuje.

## 19.10 Odloženo po dni 90

- AI chatbot pro makléře v aplikaci (interní asistent „napiš za mě e-mail“, „shrň komunikaci s klientem“): hodnota nízká vzhledem k buildu. Zvážit později jako součást MAKLÉŘ+.

# 20. Systémová pravidla (platí všude)

- AI odpovídá výhradně z polí Nemovitosti a Nastavení. Co v datech není, to se neodpovídá — eskaluje se. Žádné vymýšlení.

- Každá automatická akce zanechá stopu: zapsanou Aktivitu. Historie musí být úplná i bez člověka.

- Stav (Kontakt) a Fáze + Výsledek (Deal) nesmí být nikdy prázdné — jinak záznamy „mizí“ z pohledů.

- Deduplikace před založením, vždy (telefon → e-mail).

- Odložené bloky (pozemek, komerční, pronájem, kancelářská pole) se nemažou — v prvním běhu se jen nevyplňují.

- GDPR: doplnit pole souhlasu na Kontakt (15.1, blok Souhlas); souhlas se zaznamenává při prvním kontaktu.

# 21. Pořadí stavby

Krok

Co se staví

Hotovo, když

1

Pět tabulek se všemi poli dle kapitoly 15 (včetně doplnění GDPR polí na Kontakt).

Tabulky existují, povinná pole a číselníky nastaveny.

2

Propojení dle kapitoly 16 (Kontakt–Deal, Nemovitost–Deal, Kontakt–Nemovitost, Aktivita na obojí).

Z karty člověka se lze prokliknout na jeho obchod a zpět.

3

Čtyři pohledy dle kapitoly 17 (kanban, karta kontaktu, karta nemovitosti, dnešní připomínky).

Denní práce jde vést jen přes pohledy.

4

Testovací průchod: 1 vlastník, 1 nemovitost, 2 zájemci, pár aktivit; ručně projet obchod od leadu po podpis.

Průchod ničím nedrhne; případné chybějící pole se doplní teď.

5

Naplnění obsahu: karty nemovitostí (fakta pro odpovědi) + Nastavení (hlas, podpis, pravidla).

AI má z čeho odpovídat a jakým hlasem.

6

Hero tok 18.1 + eskalace 18.2 nad hotovými tabulkami.

Testovací poptávka projede kroky 1–8 bez ručního zásahu.

7

Pilot na reálném makléři s pár inzeráty; měří se reakční čas, podíl odpovědí bez eskalace, no-show.

Jedna reálná poptávka projde celým řetězcem až k follow-upu.

Definice hotového MVP: přijde reálná poptávka ze Sreality → do ~2 minut odejde správná odpověď jménem makléře s rezervačním odkazem → zájemce si rezervuje termín → makléři přijde notifikace → den po prohlídce dorazí follow-up. Když tohle projede end-to-end, systém je živý.

# 22. KPI a metriky úspěchu

Co se měří, aby bylo jasné, že systém funguje — u pilotu i v běžném provozu. Stejná čísla slouží jako podklad pro case study a reporting kancelářím.

Metrika

Cíl / práh

Proč

Reakční čas na poptávku

≤ 2 minuty (červená &gt; 30 min)

Jádro hero funkce; přímo řeší ztrátu 20–30 % leadů.

Podíl odpovědí bez eskalace

~80 % a víc

Kvalita karet nemovitostí a AI; nízké číslo = doplnit fakta do karet.

Konverze poptávka → rezervovaná prohlídka

sledovat trend

Měří, jestli kvalifikace + rezervační tok reálně vede k prohlídkám.

No-show rate

pokles po nasazení reminderů

Přímý efekt SMS reminderů; argument do case study.

Reakce na follow-up po prohlídce

sledovat podíl odpovědí 1/2/3

Zásobuje matching a značkuje horké zájemce.

Reaktivace z matchingu

počet oslovených / odpovědí / prohlídek

„Mrtvá databáze začne vydělávat“ — hodnota MAKLÉŘ+.

Vrácení majitelé z follow-upu

počet za období

1 vrácený majitel = 100K+ provize; nejsilnější akviziční argument.

Byznys metriky

počet klientů, MRR, churn

Cíl 31. 12. 2026: 8–10 klientů, 40–70K MRR.

# 23. Detailní checklist stavby

Dílčí úkoly k odškrtání v pořadí stavby (souhrn; plná verze se 120 úkoly a vysvětleními existuje jako samostatná tabulka Checklist_stavby_CRM.xlsx).

Blok

Dílčí úkoly

Datový model

Vypsat pole entit Kontakt/Nemovitost/Deal/Aktivita dle kap. 15, nakreslit vztahy, určit povinná pole. Doplnit GDPR pole na Kontakt.

Identita

Klíč pro rozpoznání osoby (telefon → e-mail), pravidlo deduplikace, více rolí u jedné osoby.

Kontakty

Seznam + hledání, formulář, detail s historií, rychlé akce.

Nemovitosti

Seznam + filtr, formulář, fotky, propojení s kontakty, podmíněné bloky dle druhu.

Deal + pipeline

Fáze dle číselníku, kanban s tažením, klíčové info na kartičce.

Aktivity

Poznámky u kontaktu i dealu, timeline, typy aktivit, režim připomínky (Kdy + Hotovo).

Pohledy

Kanban, karta kontaktu, karta nemovitosti, dnešní připomínky.

Testovací průchod

1 vlastník + 1 nemovitost + 2 zájemci; ručně projet obchod od leadu po podpis.

Zdroj odpovědí

Karty nemovitostí s fakty (co je v ceně, termín předání), Nastavení (hlas, podpis, pravidla, eskalace).

Sběr leadů

Přesměrování portálových e-mailů, extrakce údajů, založení Kontakt+Deal, párování dle ID inzerátu, test na Sreality/iDNES.

Okamžitá odpověď

Sestavení z dat Nemovitosti + Nastavení, kvalifikační otázky, odeslání do ~2 minut, test tónu.

Rezervace

Odkaz na kalendář, blokace slotu, zápis do Dealu, notifikace makléři.

Eskalace

Detekce neznámého dotazu, předání makléři, záznam „lead čeká na člověka“.

Remindery

SMS 24 h a 2 h předem, potvrzení/zrušení, uvolnění slotu.

Follow-up

Zpráva den po prohlídce, volba odpovědi, horký → upozornění, nezaujalo → matching.

Pilot

Reálný makléř, pár inzerátů; měřit reakční čas, podíl bez eskalace, no-show.

# 24. Další kroky — čím začít

Fundament (datový model) je hotový a zrevidovaný. Postup: (1) doplnit GDPR pole na Kontakt, (2) postavit tabulky a propojení dle kap. 15–16, (3) pohledy dle kap. 17, (4) testovací průchod jedním obchodem, (5) naplnit karty nemovitostí a Nastavení, (6) postavit hero tok dle kap. 18.1 + eskalaci 18.2, (7) pilot na reálném makléři.

MVP je živé, když jedna reálná poptávka projede celým řetězcem: poptávka ze Sreality → odpověď do ~2 minut jménem makléře s rezervačním odkazem → rezervace termínu → notifikace makléři → follow-up den po prohlídce.

Hero funkce (speed-to-lead) je to, čím se jde na trh; follow-up majitelů a AI Studio jsou „přidáme příště“.
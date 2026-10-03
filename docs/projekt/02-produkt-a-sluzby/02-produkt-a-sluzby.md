# 02 — Produkt a služby: co všechno má Brokerly umět

> ► **Stav 3. 10. 2026:** aktuální seznam služeb je [sluzby-katalog.html](sluzby-katalog.html), pořadí stavby [plan-stavby.html](plan-stavby.html). Tenhle dokument zůstává jako zdroj provozních detailů jednotlivých funkcí z master dokumentu; etapy a pořadí v něm už neplatí.

Zdroj: master dokument kap. 4, 10–12, 14, 17–19, 21–23. Statusy doplněny
k 1. 10. 2026 podle kódu a databáze (detail v [03](../03-stav-aplikace/03-stav-aplikace.md)).

Legenda statusů: `hotovo` · `rozestavěno` · `plán` (je ve specifikaci, nezačalo
se) · `nový návrh` (doplněk z mapy automatizace, bez specifikace) · `odloženo`
· `zamítnuto` · `?`

---

## 1. Tři vrstvy produktu

```
┌─────────────────────────────────────────────────────────────┐
│  3. SERVIS           onboarding, provoz, Studio, reporting    │  = co klient platí
├─────────────────────────────────────────────────────────────┤
│  2. AUTOMATIZACE     speed-to-lead, triáž, follow-up,         │  = „ruce"
│                      matching, digest, akvizice…              │
├─────────────────────────────────────────────────────────────┤
│  1. CRM JÁDRO        5 tabulek + 4 pohledy                    │  = „kartotéka"  ◄ TADY JSME
└─────────────────────────────────────────────────────────────┘
```

Každá vyšší vrstva jen čte a zapisuje do té spodní. Proto pořadí stavby.

---

## 2. Vrstva 1 — CRM jádro („Denní jádro", etapa 1)

### 2.1 Pět tabulek

| Tabulka | Co je | Klíčové pravidlo | Status |
|---|---|---|---|
| **Kontakt** | Jedna karta na člověka, i s více rolemi (kupující + vlastník) | Identita = telefon nebo e-mail; **dedup před založením, vždy** | `hotovo` |
| **Nemovitost** | Co se prodává/pronajímá; větvení podle druhu (byt / dům / pozemek / komerční / garáž) | `Co je v ceně / fakta pro odpovědi` + `Možný termín předání` = **jediný zdroj**, ze kterého AI smí odpovídat | `hotovo` (+ pole navíc, viz 03) |
| **Deal** | Jeden zájemce o jednu nemovitost = jeden obchod. **Most** mezi člověkem a nemovitostí. Prochází fázemi lead → … → podpis | `Fáze` a `Výsledek` nikdy prázdné | `hotovo` |
| **Aktivita** | Dvě funkce v jedné: záznam minulosti (hovor, e-mail, prohlídka) **a** připomínka do budoucna. Rozlišuje `Je to připomínka?` + `Kdy` | Z aktivit se skládá timeline u kontaktu i dealu; každá automatická akce zanechá stopu | `hotovo` |
| **Nastavení** | Jedno nastavení na makléře: identita odesílatele, hlas AI (oslovení, tón, ukázky), pravidla (reakční limit, eskalace, pracovní doba, kvalifikační otázky) | Bez vyplněného Nastavení se hero tok nespouští | `hotovo` jako formulář; `plán` jako konfigurace něčeho — zatím na ni nic nenavazuje |

Kompletní seznam polí, typů, povinnosti a číselníků: `AGENTS.md` §4 (verze pro
stavbu) a master dokument kap. 15 (verze s vysvětlením „k čemu slouží").

**Odložené bloky** (ve specifikaci jsou, v etapě 1 se nevyplňují, nemažou se):
pozemek, komerční, pronájem (kauce, poplatky, doba nájmu, dostupné od,
vybavení), kancelářská pole (přiřazený makléř, pravidlo přiřazení, eskalace
při nereakci, příjemce reportu), GDPR blok (souhlas, datum, zdroj).

> ► **Stav 10/2026:** bloky pozemek, komerční i pronájem jsou v aplikaci
> **vyplnitelné** (přidány 17. 8.) — spec říkala „nevyplňovat". GDPR blok je
> v kontaktu, ale nic ho nehlídá. Viz 03 §3.

### 2.2 Vztahy

| Vazba | Kardinalita | Co díky tomu vidím |
|---|---|---|
| Kontakt → Deal | 1:N | na kartě člověka všechny jeho obchody |
| Nemovitost → Deal | 1:N | na kartě nemovitosti seznam zájemců s fázemi |
| Kontakt → Nemovitost | 1:N | u vlastníka všechny jeho nabídky |
| Kontakt → Aktivita, Deal → Aktivita | 1:N | timeline |
| Co hledá ↔ Nemovitost | logická | **matching**: nová nemovitost → seznam sedících zájemců |

Status: `hotovo` (prokliky kontakt → obchod → nemovitost fungují).

### 2.3 Čtyři denní pohledy

| Pohled | Z čeho | Jak | Status |
|---|---|---|---|
| **Kanban obchodů** | Deal | sloupce = Fáze; kartička nese název, financování, další krok + termín; tažení = změna fáze | `hotovo` |
| **Karta kontaktu** | Kontakt + Deal + Aktivita | pole + obchody + timeline (nejnovější první) | `hotovo` — ale stará generace UX (audit B7) |
| **Karta nemovitosti** | Nemovitost + Deal | pole + zájemci s fázemi; dnes 4 záložky Přehled / Informace / Zájemci / Provize | `hotovo` — nejpropracovanější obrazovka |
| **Dnešní připomínky** | Aktivita | filtr připomínka = ano, hotovo = ne, kdy ≤ dnes; řazení dle kdy | `hotovo` |

Navíc, mimo specifikaci: **Dashboard** (rozcestník s prioritami dne,
připomínkami, novými poptávkami, počty) — `rozestavěno`, část dat je natvrdo
vymyšlená (viz 03).

### 2.4 Definice hotového pro etapu 1

Testovací deal projde z `lead` do `podpis` **jen přes pohledy** (kanban + karty
+ připomínky), nic nedrhne, všechny 4 pohledy fungují. Pak se otevírá etapa 2.

> ► **Stav 10/2026:** `?` — průchod nebyl formálně zaznamenán. Testovací data
> existují (2 nemovitosti v migracích, 2 obchody), ale „ničím nedrhne" nikdo
> nepodepsal. Audit z 26. 8. našel 24 míst, kde to drhne; část je opravená.

---

## 3. Vrstva 2 — automatizace („ruce")

### 3.1 Hero funkce: speed-to-lead tok (poptávka → rezervovaná prohlídka)

To, čím se jde na trh. Jeden spojený řetězec, cíl odpověď **do ~2 minut**.
Vstupem z portálů je **vždy e-mail** (portály nemají API pro výdej poptávek);
výstupy e-mail, kalendář, SMS.

| Krok | Co se stane | Čte / zapisuje |
|---|---|---|
| 1. Příchod poptávky | Portál pošle notifikační e-mail → přesměrovaný na sběrné místo (alias `makler@brokerly.cz` nebo filtr ve schránce; nastavíme při onboardingu, ~20 min) | vstup: e-mail |
| 2. Parsování + zápis | Z e-mailu jméno, telefon, e-mail, ID inzerátu, dotaz. Dedup → Kontakt (kupující, zdroj = portál, stav nový) + Deal (lead) + párování s Nemovitostí dle ID inzerátu + Aktivita (e-mail, příchozí) | Kontakt, Deal, Aktivita |
| 3. Složení odpovědi | AI **jen** z polí Nemovitosti (fakta, termín předání, parametry) + Nastavení (tón, oslovení, podpis). Když odpověď v datech není → eskalace | Nemovitost, Nastavení |
| 4. Odeslání + kvalifikace | Odpověď jménem makléře s rezervačním odkazem a kvalifikačními otázkami (financování, termín, účel) | Aktivita; e-mail |
| 5. Rezervace termínu | Zájemce vybere slot v kalendáři → Deal do fáze prohlídka, odpovědi do polí kvalifikace | Deal; kalendář |
| 6. Notifikace makléři | SMS: kdo, jaká nemovitost, kdy, financování | SMS |
| 7. Remindery | SMS zájemci 24 h a 2 h předem s potvrzením/zrušením. Zrušení → slot volný, Deal zpět, makléři upozornění | Deal, Aktivita; SMS |
| 8. Follow-up po prohlídce | Den po: dotaz na dojem (vážný zájem / zvažuji / nezaujalo). Vážný → teplota horký + upozornění. Nezaujalo → Deal prohraný, kontakt zůstává v matchingu | Aktivita, Deal; e-mail/SMS |

**Kvalifikační logika A/B/C** (podle reakce na otázky):

| | Kdy | Co se stane |
|---|---|---|
| **A — kvalitní** | konkrétní odpověď na financování + termín | SMS makléři, rezervační link, priorita |
| **B — nejasný** | vyhýbavá / částečná | do ranního digestu; rezervační link dostává |
| **C — studený** | nereaguje | **bez** rezervačního linku; do databáze pro matching |

Bez odpovědi do 24 h → automatický druhý dotaz. Rezervační link jen A a B —
ochrana kalendáře.

**Co potřebujeme od makléře:** nastavené přeposílání, 3 ukázky jeho odpovědí,
podpis, telefon pro notifikace. Balík MAKLÉŘ.

**Eskalace na člověka** (od první verze, napříč): dotaz bez odpovědi v datech,
citlivý/právní dotaz, nespokojený zájemce, cokoli mimo scénář → AI nehádá, odpoví
„ozve se makléř", založí Aktivitu-připomínku „lead čeká na člověka", pošle
upozornění. Pravidlo je textově v Nastavení, jde měnit bez zásahu do systému.

**Definice živého MVP:** reálná poptávka ze Sreality → do ~2 min odpověď jménem
makléře s rezervačním odkazem → rezervace → notifikace → follow-up den po
prohlídce. End-to-end bez ručního zásahu.

**Ukázkový průchod** (Notion „První krok v Brokerly") — konkrétní makléř Petr
Zach, zájemce Jan Novák, byt 2+kk Slovanská v Plzni: poptávka ze Sreality se
ptá na sklep → do 2 min odpověď jménem makléře („ano, zděný sklep 3 m²")
+ rezervační link + 2 otázky (financování, stěhování) → Novák si vybere úterý
15:00 a napíše „předschválená hypotéka u KB" → SMS makléři → SMS zájemci 24 h
a 2 h předem (s číslem makléře kvůli parkování) → ráno 7:30 digest („Dobré
ráno, Petře! ☕ …") → den po prohlídce e-mail se třemi tlačítky [1] vážný zájem
/ [2] zvažuji / [3] nezaujalo → [1] = „HORKÝ ZÁJEMCE", [3] = do matchingu.
Celé znění e-mailů a SMS je v exportu — **použitelné rovnou jako šablony**.

Doplňující pravidla z Notionu (procesy 1.1, 2.1–2.3): délka prohlídky **45 min
výchozí**; zájemce může na SMS odpovědět **STOP** → rezervace se zruší;
follow-up po prohlídce má mít **nastavitelný čas**; bez reakce do 48 h → další
jemné připomenutí; bez reakce do týdne → stav „vychladlý" + matching.

Status: `plán` — nezačalo se. Nic z toho v kódu není.

### 3.2 Kvalifikace proti realitním turistům (rozšíření hero toku)

Hovor je tření → patří **až po projeveném zájmu** (po rezervaci), ne jako
bariéra na vstupu. Otázky: financování, musí nejdřív prodat?, timing, potvrzení
termínu. Skóre zelený / žlutý / červený (turista → makléř na fyzickou prohlídku
nejede, nabídne online nebo dlouhodobý follow-up). Nestandardní odpověď →
makléři. Levnější mezikrok před hlasem: **SMS/WhatsApp dokvalifikace**.
Hlasová asistentka je „přidáme příště". Status: `plán`.

### 3.3 Triáž e-mailové schránky

Napojení Gmail/Outlook přes OAuth. Každý e-mail → POPTÁVKA / AKTIVNÍ OBCHOD
(klient, advokát, banka, katastr) / ÚŘADY A FAKTURY / NEWSLETTER. Poptávka →
hero tok. Aktivní obchod → okamžitá SMS se shrnutím v jedné větě. Ostatní →
digest. **Konzervativní pravidlo: nejistota = AKTIVNÍ OBCHOD, nikdy spam.**
Důvěra: „data zůstávají ve vaší schránce, AI jen čte" + zpracovatelská smlouva.
Balík MAKLÉŘ. Status: `plán`.

### 3.4 Sběr podkladů od majitelů (Google Drive)

Po podpisu smlouvy makléř zaškrtne, co potřebuje (LV, PENB, fotky, půdorys…).
Majiteli e-mail s checklistem a odkazem na sdílenou složku (**makléřův Drive**,
ne náš — GDPR). Každé 3 dny urgence na chybějící. Po nahrání notifikace + AI
kontrola, že dokument dává smysl. Zkracuje obchod o 2–4 týdny — **wow efekt
v demu**. Balík MAKLÉŘ. Status: `plán`.

### 3.5 Akvizice: monitoring a expirace

- Denní monitoring inzerátů **bez RK** v regionu (Sreality, Bazoš) → noví
  majitelé do databáze → ráno v digestu („noví majitelé v regionu: 7").
- **Právní pravidlo: systém nikdy sám nerozesílá zprávy majitelům.** Jen seznam;
  volá makléř. Interně „data servis".
- Expirované inzeráty: 60+ dní bez prodeje a bez RK → alert do digestu. Datum
  prvního výskytu vedeme sami (portál ho při změně ceny mění) → denní snapshot.

Balík MAKLÉŘ+. Status: `plán`.

### 3.6 Dlouhodobý follow-up majitelů

Majitel: „ozvěte se za 6 měsíců". Makléř zadá 4 pole (jméno, telefon, datum
návratu, lokalita), zbytek běží sám:

| Kdy | Co |
|---|---|
| D+0 | poděkování za schůzku |
| každý 1. v měsíci | e-mail „vývoj cen ve vaší lokalitě" z tržních dat (průměr za m², prodeje za 90 dní) |
| D−7 | úkol makléři v digestu: „tento týden volat" |
| D-day | SMS makléři + souhrn historie kontaktů |

**Nejsilnější prodejní argument akviziční vrstvy** (1 vrácený majitel = 100K+).
Balík MAKLÉŘ. Status: `plán`.

### 3.7 Matching (párování poptávky na nabídku)

Spouštěč: nová Nemovitost „v nabídce". Projdou se kupující; filtr transakce →
druh → lokalita → rozpočet od–do (Notion: **±10 %**) → dispozice. Shoda =
sedícím zájemcům odejde nabídka tónem makléře („Vzpomněli jsme si na vás, mám
pro vás vhodný byt"), založí se Deal (lead) + Aktivita. Balík MAKLÉŘ+ —
Notion: vyžaduje **aspoň 50 leadů v databázi**, tj. 1–2 měsíce běhu. Prodejní
věta: „máte v telefonu 200 lidí, kteří kdysi hledali — kdy jste jim naposled
poslal něco nového?" Notion navíc navrhuje **dvoustranné párování** (nový
kupující → existující nabídky, a naopak).

> ► **Stav 10/2026:** `rozestavěno` — **jediná funkce z vrstvy 2, která v kódu
> existuje**, byť jen v ruční podobě: karta nemovitosti ukazuje „Možní zájemci"
> (kontakty, jejichž poptávkový profil sedí: transakce, druh, dispozice,
> rozpočet) a seznam nemovitostí ukazuje jejich počet. Nic se neodesílá, Deal se
> nezakládá. Postaveno 6. 7. jako „automatic DB buyer matching".

### 3.8 Ranní digest — „tvář produktu"

Každý den 7:30. Struktura: 1) tři priority dne, 2) noví leady se skóre,
3) dnešní prohlídky, 4) majitelé k oslovení, 5) věci z inboxu vyžadující
pozornost. Osobní tón asistentky, křestním jménem, zmíní včerejšek. **Klient
kvůli digestu platí maintenance — investovat do designu a tónu.** Jen čte.
Status: `plán`. (Dashboard v aplikaci je jeho obrazovková obdoba.)

### 3.9 Recenze a výroční péče (bonusy MAKLÉŘ)

7 dní po předání → e-mail kupujícímu → při „ano" přímý link na Google recenzi
(Place ID zjistíme při onboardingu; makléři s 50+ recenzemi vyhrávají lokální
vyhledávání). Rok po předání → výroční e-mail + jemná žádost o doporučení.
Status: `plán`.

### 3.10 Kancelářská vrstva (KANCELÁŘ)

- **Distribuce leadů s eskalací:** lead → makléř (rotace / lokalita) → 15 min
  na převzetí kliknutím → dalšímu → po třetí eskalaci řediteli.
- **Reporting vedení:** pondělí 6:00 PDF řediteli — reakční časy per makléř,
  poptávky, rezervace, uzavřené obchody, červeně podvýkonní (reakce > 30 min),
  top makléři. Vizuál musí působit seriózně.

Status: `plán`, druhá fáze.

### 3.11 Odloženo po dni 90

AI chatbot pro makléře v aplikaci („napiš za mě e-mail", „shrň komunikaci") —
hodnota nízká vzhledem k buildu („makléř si to řekne ChatGPT za 200 Kč sám").
Zvážit jako součást MAKLÉŘ+. Status: `odloženo`. (V kořenových poznámkách
Notionu je přesto „udělat umělou inteligenci – chatbot" — rozpor uvnitř
Notionu, viz 07.)

### 3.12 Chytré detaily navíc (Notion „CRM Systém struktura")

Věci, které stret.ai nemá a stojí za zvážení:

| Návrh | Stav 10/2026 |
|---|---|
| Dokumenty a smlouvy v systému — generování rezervační / zprostředkovatelské smlouvy z dat dealu + e-podpis + úložiště u dealu | úložiště dokumentů u nemovitosti `hotovo`; generování a e-podpis `plán` |
| **Provize a finanční přehled** — kolik vydělal, co je v pipeline, **predikce příjmu z otevřených dealů** | provize u nemovitosti `hotovo`; souhrn a predikce `plán` |
| GDPR a evidence souhlasů | pole `hotovo`, hlídání `plán` |
| **Mobilní použití** — rychlý zápis z telefonu / hlasem po prohlídce | responzivní UI `hotovo`; hlasový zápis `plán` |
| Archivace kontaktů a nemovitostí | `plán` (kořenové poznámky Notionu) |
| Označení „prodá později" s filtrací | stav nabídky `prodá později` existuje; filtr `plán` |

---

### 3.13 Deset obav makléře a co mu slíbíme

Co makléř řekne, než nám dá data a schránku, co odpovíme doslova a co pro to
musí být technicky a smluvně pravda — tabulka u otázky 12 v
[dotazníku](../01-mise-a-vize/dotaznik-mise-a-vize.md) (odsouhlaseno 2. 10. 2026). Čtyři sliby
z ní dnes nedržíme a jsou **podmínkou před prvním klientem**: schvalovací
režim odpovědí na začátku, export dat jedním tlačítkem, oddělení dat makléřů,
zpracovatelská smlouva. Start přes přeposílání poptávek, ne přes přístup do
schránky (čtení Gmailu přes API = ověření u Googlu + roční audit).

## 4. Vrstva 3 — servisní produkty

### 4.1 AI Studio

Čistě servisní tok (objednávka → zpracování → dodání do 24 h), žádný build
automatizací. Objednávka v portálu, výsledky na sdílený Drive. **Ondřejova
doména od dne 1.** Nástroje podle Notionu: CubiCasa / Matterport (scan
telefonem, ~15 min práce), Floorplanner (ruční překreslení, ~45 min), Virtual
Staging AI + Reimagine Home (staging, vizualizace), Photoshop (retuš 10–15 min),
Claude API (popisky), Higgsfield (zmíněn jako možnost). Instruktážní video pro
scanování pošleme makléři.

| Výstup | Cena | Náklad | Marže | Poznámka |
|---|---|---|---|---|
| 2D/3D půdorys (ze scanu telefonem) | 1 200 Kč | ~150 | ~87 % | alternativa: ruční překreslení z fotky |
| Virtual staging | 400 Kč/foto | ~30 | ~92 % | 2–4 varianty stylu + retuš; vždy disclaimer „virtuálně zařízeno" |
| Renovační vizualizace | 600 Kč/foto | ~50 | ~92 % | starý byt → „po rekonstrukci" |
| Popisek inzerátu + překlady | 300 Kč | <10 | ~97 % | 3 varianty (krátká/emoční/věcná), EN/DE/UA |
| **Balíček „inzerát komplet"** | **3 500 Kč** | | | 5× staging + půdorys + popis CZ/EN. **Prodejní priorita** — nejvyšší ticket, jeden tok |

Roadmapa říkala „Studio spuštěno okamžitě" (červenec). Status: `?` — v repu nic,
provoz by byl mimo aplikaci.

### 4.2 Onboarding klienta (co děláme my)

Přeposílání e-mailů (~20 min po vzdálené ploše), 3 ukázky odpovědí, podpis,
telefon, Google Place ID, sdílená složka na Drive, karty nemovitostí s fakty,
vyplněné Nastavení. Po šablonizaci ~4 h/klient. Status: `plán`.

---

## 5. Mapa automatizace — celý životní cyklus makléře

Co z práce makléře řešíme a čím. Klíčové: makléř neprodává nemovitosti —
**prodává službu zprostředkování**; velká část práce je akvizice.

| Fáze | Činnost makléře | Naše řešení | Spec | Kód 10/2026 |
|---|---|---|---|---|
| **0 Příprava** | kvalifikace, značka, web, znalost trhu, nástroje | — (lidská práce) | — | — |
| **1 Akvizice** | vyhledávání samoprodejců | monitoring + scraping soukromé inzerce (Bazoš, Sreality) | v systému | — |
| | neúspěšně prodávané nemovitosti | alert na expirované inzeráty (60+ dní) | v systému | — |
| | oslovování majitelů | AI příprava personalizovaného oslovení | nový návrh | — |
| **2 Získání klienta** | cenová analýza | automatická cenová analýza vůči trhu | nový návrh | — |
| | kontrola právního stavu | automatický sběr podkladů (LV, PENB) – Drive | v systému | — (ruční nahrání dokumentů ke kartě `hotovo`) |
| | zprostředkovatelská smlouva | generování / předvyplnění + e-podpis | nový návrh | — |
| **3 Marketing** | home staging | virtual staging (Studio) | v systému | — |
| | půdorys | generování 2D/3D | v systému | — |
| | inzerát | AI popisky + překlady | v systému | — |
| | prezentace nemovitosti | auto-generování microsite | nový návrh | — |
| | spuštění inzerce | auto-publikace na servery a sítě | nový návrh | — |
| | *(obráceně)* převzetí inzerátu z portálu do CRM | — | není ve spec | **`hotovo`** — import z URL (Sreality + obecné portály), včetně fotek |
| **4 Zájemci** | odpovídání na dotazy | okamžitá automatická odpověď + AI chatbot | v systému | — |
| | kvalifikace zájemců | automatická kvalifikace | v systému | — (ruční pole financování/termín `hotovo`) |
| | zápis leadu | automatický zápis do CRM | v systému | — (ruční `hotovo`) |
| | třídění pošty | triáž schránky | v systému | — |
| | organizace prohlídek | samoobslužná rezervace | v systému | — |
| | prevence no-show | SMS 24 h / 2 h | v systému | — |
| | zpětná vazba po prohlídce | automatický follow-up + značkování | v systému | — (ruční „výsledek follow-upu" `hotovo`) |
| | neúspěšní zájemci | matching s novými inzeráty | v systému | `rozestavěno` (ruční „Možní zájemci") |
| | report majiteli | automatický report o průběhu | nový návrh | — |
| **5 Uzavření** | rezervační smlouva | generování z dat leadu | nový návrh | — |
| | vklad do katastru | hlídání lhůt + notifikace | nový návrh | — |
| **6 Dokončení** | předání | generování protokolu + zápis měřidel | nový návrh | — |
| | recenze | automatická žádost o Google recenzi | v systému | — |
| | aftercare | výroční zprávy + dotazy na doporučení | v systému | — |
| **Průřezově** | denní organizace | ranní digest | v systému | `rozestavěno` (Dashboard, částečně mock) |
| | *(podrobnější kroky fází 1–6 z Notionu: lead magnety a kampaně, nákup leadů, cenová analýza z katastru, výhradní/nevýhradní smlouva, den otevřených dveří, 20denní ochranná lhůta vkladu, daňové povinnosti)* | — | — | — |
| | péče o majitele | dlouhodobý follow-up + reporty | v systému | — |
| | **provize a náklady obchodu** | — | není ve spec | **`hotovo`** — sazba, částka, stav, náklady, čistá provize |

---

## 6. Etapy stavby (pořadí z master dokumentu kap. 21)

| Krok | Co | Hotovo, když | Stav |
|---|---|---|---|
| 1 | Pět tabulek se všemi poli (vč. GDPR) | tabulky, povinná pole, číselníky | `hotovo` |
| 2 | Propojení | z karty člověka proklik na obchod a zpět | `hotovo` |
| 3 | Čtyři pohledy | denní práce jde vést jen přes pohledy | `hotovo` |
| 4 | Testovací průchod 1 vlastník + 1 nemovitost + 2 zájemci, lead → podpis | ničím nedrhne | `?` nezaznamenáno |
| 5 | Naplnění obsahu: karty nemovitostí (fakta) + Nastavení | AI má z čeho a jakým hlasem odpovídat | `?` — formuláře jsou, obsah pro reálného makléře ne |
| 6 | Hero tok 18.1 + eskalace 18.2 | testovací poptávka projede kroky 1–8 | `plán` |
| 7 | Pilot na reálném makléři | jedna reálná poptávka projde až k follow-upu | `plán` |

Práce od 5. 7. do 28. 9. se celá odehrála v krocích 1–3 a v jejich **vizuálním
a UX zdokonalování** (wizard pro přidání nemovitosti, import z inzerátu, galerie
fotek s ořezem, dokumenty, historie ceny, provize, filtry, redesign detailu,
responzivita). To je víc, než etapa 1 vyžadovala — a zároveň krok 4 nebyl
formálně uzavřen.

---

## 7. KPI — jak poznáme, že to funguje

| Metrika | Cíl / práh | Proč |
|---|---|---|
| Reakční čas na poptávku | ≤ 2 min (červená > 30 min) | jádro hero funkce |
| Podíl odpovědí bez eskalace | ~80 %+ | kvalita karet nemovitostí a AI |
| Konverze poptávka → rezervovaná prohlídka | sledovat trend | funguje kvalifikace + rezervace? |
| No-show rate | pokles po nasazení reminderů | argument do case study |
| Reakce na follow-up po prohlídce | podíl 1/2/3 | zásobuje matching |
| Reaktivace z matchingu | oslovení / odpovědi / prohlídky | hodnota MAKLÉŘ+ |
| Vrácení majitelé z follow-upu | počet za období | 1 = 100K+ provize |
| Byznys | klienti, MRR, churn | cíl 8–10 klientů, 40–70K MRR |

Žádná z metrik se dnes neměří — není co měřit, dokud neběží vrstva 2.

# Council — katalog služeb Brokerly (přepis)

Datum: 2. 10. 2026 · Poradci a recenzenti: Claude Sonnet · Předseda: Claude Opus · Metodika: LLM Council (Karpathy), skill `.claude/skills/llm-council/SKILL.md`

## Původní otázka (Ondřej)
Projet celý katalog služeb a systémů (`sluzby-katalog.html`) councilem: kolik služeb máme, které se vyplatí přidat, které odebrat, co nejvíc názorů na všechno.

## Framovaná otázka
Které z ~96 položek katalogu patří do **první placené verze pro sólo makléře** (pilot Dorina Šedíková), které **později** a které **nikdy**? Co v katalogu **chybí**? U každé **žluté inspirace z konkurence** beru / neberu / později s jednou větou proč.

Kompletní kontext předaný poradcům: [`vstup.md`](vstup.md) (mise, cílový makléř, ceník, stav, cesta klienta, závěry konkurence, 10 obav, všech 96 položek).

---

# Odpovědi poradců (de-anonymizované)

## Kontrarián
## Kontrarián: katalog má 96 položek a jeden produkt, který neexistuje

**Fatální chyba:** Prodáváme hero tok (#20–28), a ten není postavený. Roadmapa je 3+ měsíce pozadu, pilot neproběhl. Katalog je seznam přání, ne produkt. První placená verze = 10 položek, ne 40.

**V1 (jen toto):**
- Hero tok #20, #21, #22, #24, #25, #28.
- Pojistky #85, #87, #88.
- Bez těchto čtyř nelze prodat vůbec: #29 Schvalovací režim, #11 Přihlášení a oddělení dat, #12 Export dat, #76 Smlouva + zpracovatelská smlouva. Slibujeme je a nedržíme. #89 Data jsou makléřova a #90 Kontrola před odesláním jsou jen jiné názvy téhož, takže #89 sloučit s #12 a #11, #90 s #85.
- #33 Ranní digest, ale v tupé verzi (dnešní připomínky plus nové leady). Bez #34, protože "co říct" je halucinace čekající na stížnost.
- #78 Onboarding a #79 Revizní cally. To je ve skutečnosti naše služba.

**V1.1 (po pilotu):** #23 Kvalifikace A/B/C, #26 SMS připomínky, #27 Follow-up po prohlídce, #37 Follow-up majitelů (moat, ale bez fungujícího hero toku nikdo nezjistí, že funguje), #55 Recenze.

**Později:** #35 Matching, #43/#44 Monitoring a expirace (Filipův scraper, právní riziko scrapingu, a my máme slíbit "Sreality nás nezablokuje"), #60–64 AI Studio (jiný byznys, jiné marže), celá sekce 8 Kancelář, #53, #94–96.

**Nikdy:** #19, #54, #91–93. Přidal bych #14 Nemovitost z e-mailů: vyžaduje přístup do schránky, což je přesně obava č. 2 a CASA audit.

**Žluté, silné názory:**
- #13 Hlasový zápis: později. Efektní, ale denní bolest to neřeší.
- #15 Skóre podle chování: neberu. Nemáme e-mailové tracking data a malý objem dat skóre nenaučí.
- #16 Hlídání po rezervaci: později. Obchodů je málo a makléř to ví sám.
- #30 Ověření leadu: později. Zpomaluje reakci do 2 minut, což je celý slib.
- #36, #38, #42, #45–47, #58: později nebo neberu. Každá je malý produkt navíc.
- #48–52 Mikrostránky: neberu. THEON je dělá, my tam jen prohrajeme. #49 Rezervace stačí jako odkaz z hero toku, ne jako stránka.
- #57 Narozeniny, #59 Program doporučení: neberu, je to šum.
- #73 Demo účet a #74 Dotazník: beru, bez nich se neprodá. #82 Web brokerly.cz: beru hned, bez webu nemá kde zaplatit.
- #77 Fakturace: rozhodnout hned, je to blokér.
- #80, #83: později, nejdřív musí existovat klient s čísly.
- #65, #66: neberu.

**Co chybí:**
1. **Přeposílání poptávek, parser Sreality e-mailu.** Je to křehké (formát se mění), bez toho nic nefunguje a není to samostatná položka.
2. **Monitoring výpadků** (obava č. 6). Kdo se dozví, že přeposílání přestalo fungovat? Potřebujeme "tichý alarm" a záložní postup.
3. **Odpovědnost za slib AI** (obava č. 9). Je to smluvní bod, ne funkce, ale chybí v #76.
4. **Měření ušetřených hodin.** Slibujeme 40+ h měsíčně a nikde to neměříme. Bez toho #80 Report hodnoty a obhajoba 3,5K/měs nejde.
5. **Zrušení a odchod klienta** (obava č. 7), včetně toho, co se stane s daty.
6. **Čeština SMS a zákon o elektronických komunikacích** (souhlas se zprávami, GDPR pro cold oslovení), právní kontrola před prvním klientem.

**Fatální otázka na závěr:** Dorina má 3+ inzeráty a desítky e-mailů denně. Kolik z nich jsou poptávky ze Sreality, které by hero tok skutečně zachytil? Pokud pod 30 %, produkt nemá zákazníka.

## Myslitel od prvních principů
## Co tu vlastně řešíme

Katalog o 96 položkách je špatná jednotka. Pilot kupuje jeden výsledek: **„žádný lead nepropadne a nemusím admin"**. To je dnes řetěz #20 → #21 → #22 → #23 → #24 → #25, který neexistuje. Všechno ostatní je buď podmínka důvěry, nebo nic.

Otázka „co z 96 položek" předpokládá, že cena 40K + 3,5K se obhájí šíří. Zadání samo říká opak: obhájí se jen hero tokem a servisem. Šíře pilot nezajímá. Dorina má 3 inzeráty a potřebuje vidět jeden zachráněný lead.

## První placená verze (cca 20 položek)

- **Hero tok:** #20–#28, tedy příjem, zápis, odpověď, kvalifikace, rezervace, SMS, follow-up a eskalace.
- **Podmínky důvěry** (slib před prvním klientem): #29 Schvalovací režim, #11 Přihlášení a oddělení dat, #12 Export dat, #89 Data jsou makléřova, #76 Smlouva + zpracovatelská, #85–#88 a #90 Kontrola před odesláním. Z těchto pojistek není nic doplněk, jsou to funkce produktu. Bez nich neodpovíte na obavy #1, #4, #9.
- **Moat:** #37 Follow-up majitelů. Je to jediná věc, kterou nemá nikdo. Poběží pomalu, ale musí být v pilotu, jinak prodáváte jen opožděnou kopii USA.
- **Tvář produktu:** #33 Ranní digest.
- **Servis:** #78 Onboarding a #79 Revizní cally. Servis je to, za co se platí, ne software.
- **Jádro, které už máte:** #1–#10.

## Později
#35 Matching, #43–#44 Akvizice (Filipův scraper, až hero tok drží), #55–#56 Recenze a výročí, #31, #32, #40, #41, #53, #67–#71 Kancelář, #84, #94–#96, #18.

## Nikdy
#19, #54, #91, #92, #93. Souhlasím se vším, co je v katalogu označeno „nedělat".

## Žluté (beru / neberu / později)

- **#29 Schvalovací režim:** beru, je to podmínka důvěry.
- **#11, #12, #89:** beru, jsou to podmínky pilotu.
- **#90 Kontrola před odesláním:** beru, je to bezpečnostní pojistka.
- **#13 Hlasový zápis:** později. Je to příjemné, ale není to hero tok.
- **#30 Ověření leadu:** později. Pilot se obejde bez něj.
- **#34 Komu zavolat a proč:** beru jako součást #33, ne samostatně.
- **#38 Signály:** později.
- **#16 Hlídání obchodu po rezervaci:** později.
- **#74 Interaktivní dotazník:** beru jako nástroj prodeje a onboardingu.
- **#73 Demo účet:** beru. Import vlastního inzerátu za minutu je nejsilnější prodejní moment.
- **#75 Plán na míru:** později, zatím stačí ruční dokument.
- **#77 Fakturace:** beru, ale je to rozhodnutí, ne funkce. Jde pod #76.
- **#80 Report hodnoty:** beru velmi brzy. Slibujete „40+ hodin ušetřeno", takže to musíte měřit. Bez měření se nebudete moct bránit obavě č. 10.
- **#14, #15, #17, #36, #39, #42, #45–#52, #57–#59, #65, #66, #82, #83:** neberu / později. Je to šum nebo kopie THEON.
- **#82 Web brokerly.cz:** minimální jednostránka nutná pro důvěru, ostatní odložit.

## Co chybí

1. **Měření času odpovědi.** Slib je „do 2 minut", tak ho musí být vidět.
2. **Přeposílání poptávek jako produkt.** Je to jádro napojení (#20), ale nikde není samostatně a je to riziko č. 5, protože portály mohou přeposílání změnit.
3. **Záložní režim při výpadku** (obava č. 6): když AI nebo tok spadne, makléř dostane upozornění, ne ticho.
4. **Kdo nese odpovědnost, když AI něco slíbí** (obava č. 9): smluvní i produktový záznam.
5. **Metrika úspěchu pilotu** (1 zachráněný lead = 135K): bez ní nepoznáte, jestli pilot uspěl.

Doporučení: nejdřív postavit #20–#25 a #29, ověřit na Dorině, teprve potom rozhodovat o zbytku. Roadmapa je pozadu proto, že se rozhoduje o 96 věcech místo o jedné.

## Expanzionista
**Největší díra v katalogu: nic nepředává důkaz hodnoty.** Moat je #37 Follow-up majitelů a #33 Ranní digest, ale chybí položka, která z nich dělá peníze: **„Probuzený majitel" jako měřený výsledek** (kolik zapomenutých majitelů se vrátilo, kolik zakázek). #80 Report hodnoty je jen kosmetika; má to být kvantifikovaný příběh „zachráněná provize 135K". Tohle prodává upsell i doporučení a je to jediná obrana ceny 3,5K proti 385–1 200 Kč CRM.

**Chybí:**
1. **Reaktivace mrtvé databáze.** Každý zkušený makléř má stovky starých kontaktů a e-mailů. Jednorázový import + „probuď" kampaň je okamžitý wow v setupu (krok 7) a levnější než hero tok. Na tohle se nikdo neptá.
2. **Zachycení leadů mimo portál.** Telefon, WhatsApp, Instagram, doporučení. Hero tok (#20) řeší jen e-mail ze Sreality; makléři dostávají třetinu poptávek jinudy. Minimálně zmeškaný hovor → SMS.
3. **Odkaz „spojit s makléřem" jako nástroj akvizice.** Každá odeslaná odpověď (#22) nese podpis Brokerly nenápadně; to je virální smyčka k cíli 1 000 makléřů.
4. **Anonymizovaná data trhu napříč klienty** (kolik leadů, reakční časy, ceny podle lokality). Po 50 klientech je to datový aktiv a základ pro #45 a #47. Smluvně ošetřit až později, ale schéma připravit teď.
5. **Partnerská hypotéka / poradce** u #23 Kvalifikace: „hypotéka schválená" je nejcennější signál a poradci platí za leady.

**Podceněné s největší pákou:**
- **#37 Follow-up majitelů** a **#86 Nikdy sám neoslovuje majitele**: jádro prodeje, ne doplněk.
- **#88 Každá akce zanechá stopu**: z toho plyne #80 a case studies (#83), tedy marketing zdarma.
- **#64 Balíček „inzerát komplet"** (3 500 Kč): přímý cash, nulový vývoj nad rámec AI; brát do verze 1 jako první peníze dřív než hero tok.
- **#7 Import inzerátu**: je to demo (#73) i prodejní zbraň; vyleštit.

**Do první placené verze:** #1–10, #20–28, #33, #37, #55, #85–88, #64, #72, #76, #78, #79, #81. Pozdější: #43–44, #35, #31, #53. Nikdy: #19, #54, #91–93.

**Žluté:**
- #11 Přihlášení: **beru**, podmínka.
- #12/#89 Export: **beru**, levné a zruší obavu 4.
- #29 Schvalovací režim: **beru**, odemyká autonomii.
- #90 Kontrola před odesláním: **beru**, brání obavě 1 a 9.
- #13 Hlasový zápis: **beru**, pro makléře v terénu nejviditelnější.
- #34 Komu zavolat a proč: **beru** do digestu, je to digest.
- #39 Týdenní report majiteli: **beru**, drží vlastníky a posiluje moat.
- #47 + #50 Odhad ceny/Chci prodat: **později**, ale je to akviziční lead magnet nejvyššího potenciálu.
- #46 AI příprava oslovení: **později**, po #43.
- #48/#49 Mikrostránky: **později**, THEON je má, ale hero tok je přednější.
- #52 Doporučení s atribucí: **beru**, laciné a roste to samo.
- #73 Demo účet, #75 Plán, #83 Case study: **beru**, prodejní materiál.
- #14, #15, #16, #36, #38, #42, #45: **později**.
- #17 Archivace, #57 Narozeniny, #58, #59, #65, #66, #82: **neberu / později**, nízká páka.
- #30 Ověření leadu: **později**.
- #74, #77, #80: **beru** (#77 rozhodnout s Filipem).

## Outsider
## Outsider: pohled Dorinou, která to vidí poprvé

**Hlavní dojem:** 96 položek pro někoho, kdo chce "aby žádný lead nepropadl". Katalog je seznam všeho, co jste viděli, ne produkt. Dorina koupí tři věci: odpověď na poptávku, ranní seznam, hlídání majitelů. Zbytek je šum.

**První placená verze (jádro, ~14 položek)**
- Hero tok: 20 Příjem poptávky, 21 Zápis leadu, 22 Okamžitá AI odpověď, 24 Rezervace prohlídky, 25 Notifikace makléři, 28 Eskalace na člověka. 23 Kvalifikace A/B/C a 26 SMS připomínky ano, ale jednoduše.
- 29 Schvalovací režim: BERU. Bez něj Dorina nepustí AI ke klientům (obava č. 1, 9).
- 33 Ranní digest, 37 Follow-up majitelů (to je důvod, proč platit).
- 11 Přihlášení a oddělení dat, 12 Export dat, 89 Data jsou makléřova: BERU, jsou to sliby před prvním klientem. 12 a 89 jsou jedna věc dvakrát.
- 85 AI odpovídá jen z karty, 87 Nejistota = notifikace, 76 Smlouva + zpracovatelská smlouva, 78 Onboarding, 79 Revizní cally.

**Matoucí a nafouknuté**
- 90 Kontrola před odesláním se kryje s 85 a 29. Sloučit.
- 88 Každá akce zanechá stopu je [máme], ale není to funkce, je to vlastnost. Takhle nafukujete počet na 96.
- 35 Matching, 36 Dvoustranné párování, 38 Signály: tři slova pro "nabídni byt zájemci". Dorina nepozná rozdíl. Později, jedna položka.
- 15 Skóre zájemce podle chování: nemáte e-mailové sledování, nemáte z čeho skórovat. Neberu.
- 6 Dashboard "zatím natvrdo": nepřipouštějte do placené verze.

**Později**
- 43 Monitoring samoprodejců, 44 Expirace (MAKLÉR+, Filipův scraper, právní riziko).
- 55 Recenze, 56 Výročí: levné, ale ne kvůli nim se platí.
- 13 Hlasový zápis: později, líbí se, ale není nutný.
- 30 Ověření leadu, 16 Hlídání po rezervaci, 34 Komu zavolat a proč (součást digestu, ne zvlášť), 80 Report hodnoty.
- Celý blok 8 Kancelář a 18, 31, 32, 53, 84, 94, 95, 96.

**Nikdy**
- 19, 54, 91, 92, 93 souhlasím. Přidal bych 57 Narozeniny a svátky, 58 Zpráva o hodnotě bytu, 59 Program doporučení, 71 Nábor makléřů: dekorace, z oboru zjevně neodvozené. 66 Úprava fotek také ne, 61/62 Staging už je.

**Mikrostránky 48–52:** neberu. Konkurent THEON je má, ale Dorina má inzerát na Sreality. Proč by posílala klienty jinam? 47 AI odhad ceny jako lead magnet: neberu, odhad ceny je právně riziko.

**AI Studio 60–66:** je to jiný byznys (ceny za kus, 24h dodávka), nesouvisí s "asistentem, který jedná za tebe". Mimo první verzi, pokud nemáte kapacitu.

**Žluté servisní položky 72–75, 77, 82, 83:** 73 Demo účet beru (váš nejsilnější argument je import jejího inzerátu), 74 Dotazník a 75 Plán na míru jsou prodejní proces, ne produkt, nepatří do katalogu funkcí. 82 Web brokerly.cz: beru, bez webu vás Dorina nenajde. 77 Fakturace: rozhodnout s Filipem, ne council. 83 Case study: až bude první klient.

**Co chybí**
- Co se stane, když AI nefunguje nebo Sreality změní formát e-mailu (obava č. 6). Žádná položka "monitoring výpadků".
- Co když nepřijde poptávka z portálu, ale telefonát nebo WhatsApp od neznámého. Hero tok předpokládá jediný kanál.
- Ukončení spolupráce a předání dat.
- Cena: 3,5K/měs vs. CRM za 385 Kč. Dorina se zeptá "za co přesně platím navíc" a odpověď musí být jedna věta, ne 96 řádků.

**Odrazující:** pojmy "hero tok", "moat", "matching", "triáž", "akvizice". Dorina to nepochopí. Mluvte "odpověď do 2 minut, nic nepropadne".

## Exekutor
## Exekutor: co reálně postavit do pondělí a po něm

**Realita:** hero tok neexistuje, jádro (1–10) stojí, pilot neproběhl. První placená verze = jeden funkční řetězec + čtyři sliby. Všechno ostatní je prezentace.

### Minimum pro pilot s Dorinou (čísla)
- **Podmínky před prvním klientem:** 11 Přihlášení a oddělení dat, 12 Export dat jedním tlačítkem, 29 Schvalovací režim, 76 Smlouva + zpracovatelská smlouva (89 Data jsou makléřova se tím splní).
- **Hero tok:** 20 Příjem poptávky, 21 Zápis leadu, 22 Okamžitá AI odpověď, 25 Notifikace makléři, 28 Eskalace na člověka, 85 AI odpovídá jen z karty, 87 Nejistota = notifikace, 88 Každá akce zanechá stopu (máme).
- **Se schvalováním první týden:** 24 Rezervace prohlídky (stačí odkaz na její kalendář), 27 Follow-up po prohlídce.
- **Tvář produktu:** 33 Ranní digest (první verze = e-mail ze dvou dotazů).
- **Moat:** 37 Follow-up majitelů (jednoduchá verze: připomínky v CRM plus digest).
- **Servis:** 78 Onboarding, 79 Revizní cally, 86 Nikdy sám neoslovuje majitele (jen pravidlo).

### Pořadí stavby
1. 11 + 12 (nejdřív, jinak nemá smysl nikoho zvát).
2. 20 → 21 → 22 → 29 → 28. Dokud tohle neběží na jejím reálném e-mailu, nic jiného nedělat.
3. 25 SMS jen jí; 24 jako odkaz.
4. 33 digest.
5. 27 a 37.

### Ručně / servisně místo kódu
- **23 Kvalifikace A/B/C:** Dorina posoudí v notifikaci.
- **26 SMS připomínky:** zatím ručně, nebo ať je posílá její kalendář.
- **76 Smlouva:** šablona z právníka, žádný kód.
- **72, 73, 74, 75, 77, 81, 83:** Google Doc, Tally, hotový účet z jejích dat. Není to produkt, je to prodej.
- **90 Kontrola před odesláním:** stačí pravidla v promptu a schvalovací režim.
- **80 Report hodnoty:** jednou za čtvrt roku ručně z čísel.

### Žluté: beru / neberu / později
- **Beru:** 11, 12, 29, 73, 74, 75, 77, 89, 90 (sliby a prodej, skoro nulová pracnost nebo nutnost).
- **Beru, ale levně:** 34 Komu zavolat a proč (jedna věta v digestu), 82 Web brokerly.cz (jedna stránka, Ondřejova agentura), 13 Hlasový zápis (stačí diktování telefonem; dopad velký, pracnost malá).
- **Později:** 30 Ověření leadu, 36 Dvoustranné párování, 38 Signály, 39 Týdenní report majiteli (až po 37), 45–47, 48–52 mikrostránky, 55–59 péče (55 Žádost o recenzi je triviální, přidat po prvním obchodu), 65, 80, 83.
- **Neberu:** 14 Nemovitost z e-mailů (Google audit CASA, obava č. 2), 15 Skóre zájemce (bez dat bezcenné), 16 Hlídání po rezervaci, 17 Archivace (stačí filtr), 42, 57 Narozeniny, 58 Zpráva o hodnotě bytu, 66 Úprava fotek.

### Později / nikdy
- **Později:** 18, 31, 32, 35 Matching, 40, 41, 43 a 44 (po prvním platícím), 53, 67–71 Kancelář, 84, 94–96, plus AI Studio 60–64 (prodej jako servis, ruční zakázka).
- **Nikdy:** 19, 54, 91, 92, 93.

### Co v katalogu chybí
- **Napojení na Sreality poptávky:** přeposílání e-mailu z konkrétního portálu plus ověření, že formát poptávky skutečně jde parsovat. Je to největší technické riziko a v katalogu je to jen řádek 20.
- **Monitoring výpadků a záložní režim** (obava č. 6): když tok spadne, makléř dostane upozornění.
- **Odhlášení a STOP** u SMS a e-mailů, včetně GDPR souhlasu u leadu.
- **Měření času reakce:** bez toho nedoložíme slib „40+ h ušetřeno".
- **Plán odchodu klienta** (obava č. 7).
- **Cena pilotu pro Dorinu:** zdarma nebo se slevou výměnou za case study (83). Ceník z července je neověřený.

**Pondělí ráno:** vezmi její skutečný poptávkový e-mail ze Sreality a udělej z něj kontakt a obchod v CRM. Pokud to nejde, nic dalšího nemá cenu.

---

# Recenze (anonymizace: A = Exekutor · B = Kontrarián · C = Outsider · D = Expanzionista · E = Myslitel od prvních principů)

## Recenzent: Kontrarián
1. **Nejsilnější je A.** Je jediná operativní: pořadí stavby, rozdělení kód vs. servis/ruční práce, a „pondělní test" (reálný Sreality e-mail → kontakt + deal). Říká, že pokud parser nejde, nic dalšího nemá cenu. E je stručná a správně rámuje (šíře pilota nezajímá), ale míň konkrétní.

2. **Největší slepé místo má D.** Ignoruje, že hero tok neexistuje a roadmapa je 3+ měsíce pozadu, a přidává pět nových položek (reaktivace databáze, virální podpis, anonymizovaná data napříč klienty, hypoteční partneři). To je přesně rozšiřování rozsahu. Navíc „anonymizovaná data trhu" je v rozporu se slibem oddělení dat (obava č. 4) a GDPR. V1 má ~35 položek včetně #64 jako „první peníze", což je jiný byznys. Dále chybí jakákoli kritika kapacity dvou lidí.

3. **Přehlédly všechny:**
   - **Reálná kapacita:** Ondřej + Filip, 3+ měsíce skluz. Nikdo nenavrhl časový rozpočet ani „co vyhodit, když to nestihneme".
   - **Pilot jako validace, ne placená verze:** Dorina je první klient; ceník je neověřený. Jen A zmiňuje cenu pilotu, nikdo nenavrhl kritéria úspěchu/selhání a rozhodnutí go/no-go.
   - **Právní riziko autonomní AI** (zákon o spotřebiteli, odpovědnost za slib) řeší jen smluvně; B ho aspoň zmiňuje.
   - **Závislost na Filipovi** (scraper, technika) jako single point of failure.
   - **Nikdo nezpochybnil Sreality přeposílání** jako zdroj dat (podmínky portálu, obava č. 5) mimo parsování.
   - Jen B se ptá, kolik poptávek skutečně je ze Sreality.

## Recenzent: Myslitel od prvních principů
**1. Nejsilnější: E.** Jako jediná zpochybní samotnou jednotku otázky: pilot nekupuje položky z katalogu, kupuje jeden výsledek („žádný lead nepropadne"). Šíře cenu neobhájí, zadání to říká samo. Řetěz #20→#25 plus #29 ověřit na Dorině a o zbytku rozhodovat až poté. Roadmapa je pozadu, protože se rozhoduje o 96 věcech místo o jedné. A má i čitelnou metriku pilotu (1 zachráněný lead = 135K). A je nejblíž první verzi A, ale s lepším rámováním.

**2. Největší slepé místo: D.** Přidává reaktivaci databáze, virální podpis, anonymizovaná data trhu a hypotéční poradce, ale hero tok bere jako hotový. Do první verze strká ~40 položek včetně #64 a #55, což je opak zaostření. Předpokládá, že existuje klient s daty, a ignoruje roadmapu pozadu. Tržní data napříč klienty navíc narážejí na obavu č. 4 (data a konkurence).

**3. Přehlédly všechny:**
- Nikdo neověřil základní předpoklad: že Dorina vůbec chce autonomní AI. Jen B se ptá, kolik jejích e-mailů jsou poptávky ze Sreality, ale až na konci, jako kosmetika. Tohle je první krok, ještě před jakýmkoli stavěním.
- Nikdo nenavrhl pilot bez kódu (ručně, Wizard of Oz), který za týden ověří hodnotu dřív než 3 měsíce vývoje.
- Nikdo neřeší kapacitu dvou lidí: kolik položek zvládnou Ondřej a Filip skutečně postavit za zbývající čas.
- Cena pilotu a platební ochota zůstaly neověřené. Pilot za 40K setup nikdo nezpochybnil, A ho navrhuje zdarma.
- Právní stránka Sreality (ToS přeposílání a automatické odpovědi) je zmíněna jen letmo.

## Recenzent: Expanzionista
1. **Nejsilnější: E.** Přeformuluje otázku: pilot kupuje jeden výsledek, ne šíři katalogu. Řetěz #20→#25 plus #29 ověřit na Dorině a teprve pak rozhodovat o zbytku. Navíc správně žádá měření (#80) kvůli obavě č. 10. A je nejpraktičtější z hlediska pořadí stavby (A je podobná, ale E je ostřejší v diagnóze).

2. **Největší slepé místo: B.** Je defenzivní: škrtá téměř vše (#13, #82 pozdě, bez #34) a nevidí žádný upside. Chybí jí akvizice, důkaz hodnoty a rychlé peníze. C je podobně úzká: jediný kanál, jen šum k mazání.

3. **Co přehlédly všechny (kromě částečně D):**
- **Kdo je pilot a za kolik.** Dorina jako design partner zdarma/se slevou výměnou za case study, reference a doporučení. Pilot je i prodejní aktivum, ne jen test.
- **Rychlé peníze a validace bez hero toku.** Reaktivace staré databáze (D) nebo ruční „concierge" verze hero toku (Dorina přeposílá, vy odpovídáte s AI) ověří poptávku za týdny, ne měsíce. Nikdo nenavrhl.
- **Podíl poptávek ze Sreality u Doriny** (B se ptá, ale nikdo to neověřil před stavbou).
- **Sousední příležitost:** hypoteční poradci jako platící partner (D), kancelářský segment jako násobič, anonymní tržní data.
- **Wedge:** prodávat digest + follow-up majitelů samostatně, bez hero toku, který je nejrizikovější a nejpozdější.

## Recenzent: Outsider
**1. Nejsilnější: E.** Jako jediná zpochybní samotný rámec („96 položek je špatná jednotka"). Navíc cituje zadání: cena se obhájí jen hero tokem a servisem, ne šíří. Dává jasné pořadí (#20–#25 a #29, ověřit na Dorině, pak rozhodovat) a metriku úspěchu pilotu. A je nejkratší a nejčitelnější. Těsně za ní A, která má nejpoužitelnější pořadí stavby a „pondělní test" (reálný e-mail ze Sreality → kontakt a obchod).

**2. Největší slepé místo: D.** Hero tok, schvalovací režim a čtyři sliby skoro ignoruje. Do V1 přidává #64 balíček (prodej služby) a „reaktivaci mrtvé databáze". Přitom hlavní riziko je, že hlavní funkce neexistuje. Navrhuje datový aktiv, virální smyčku a hypoteční partnery (rozsah navíc u firmy 3 měsíce pozadu). Pasáž „Podceněné s největší pákou" má #86 jako pravidlo, ale chybí jí důvod, proč pilot nejdřív potřebuje fungující tok. C má podobný problém s jazykem. Radí mluvit srozumitelně, ale sama používá „hero tok" a „moat".

**3. Přehlédly všechny:**
- Nikdo nepočítá, jestli to **ve dvou lidech** vůbec stihnou. Roadmapa je pozadu, ale nikdo neodhadl pracnost ani termín první verze.
- Pilot zdarma nebo za kolik, a kdy ho vůbec zkoušet na jedné makléřce místo 8–10 klientů. Zmiňuje to jen A. Žádná odpověď neřeší, že jeden pilot nic nedokazuje.
- Autonomní odpověď bez schvalování právně a smluvně (kdo ručí) řeší jen jako položku, ne jako rozhodnutí.
- Žádná z odpovědí nezkoumá, zda Sreality přeposílání poptávek skutečně dovolí. B ji staví jako fatální otázku, jen pro podíl poptávek.
- Nikdo nenavrhl, jak ověřit zájem zaplatit před stavbou (předprodej, smlouva o záměru).

## Recenzent: Exekutor
**1. Nejsilnější: A.** Jediná dává proveditelné pořadí stavby (11+12 → 20→21→22→29→28 → SMS → digest → 27/37). Odděluje kód od servisu (23, 26, 72–77 ručně/Tally/Google Doc), což rozhoduje při zpoždění roadmapy o 3+ měsíce. Navíc má konkrétní pondělní krok: vzít Dořin skutečný poptávkový e-mail ze Sreality a udělat z něj kontakt a obchod; když to nejde, nic dalšího nemá cenu. B je těsně druhá díky otázce „kolik poptávek je ze Sreality (pod 30 % = bez zákazníka)", ale nemá pořadí.

**2. Největší slepé místo: D.** Do první verze cpe #1–10, #20–28, #33, #37, #55, #85–88, #64, #72, #76–81 a přidává další produkty (reaktivace databáze, hypotéka, anonymizovaná data). Ignoruje, že hero tok neexistuje a roadmapa je pozadu. Chybí jí priorizace podle pracnosti, monitoring výpadků i měření slibu „40+ h". Také navrhuje #64 (AI Studio) jako první peníze, což zvětšuje rozsah. C a E dávají sice správný směr, ale bez pořadí a pondělního kroku.

**3. Přehlédly všechny:**
- Ověření legality přeposílání poptávek a podmínek Sreality (obava č. 5) před stavbou, nejen formátu parsování. Chybí kontakt na portál nebo právní stanovisko.
- Kapacita dvou lidí: kdo z Ondřeje a Filipa co staví, kolik týdnů, a kdy se pilot stopne jako neúspěšný (kill kritérium).
- Pilot jako n=1: jedna makléřka není validace ceny 40K+3,5K. Dnes se neověřuje, zda za to zaplatí.
- Ruční „Wizard of Oz" pilot: hero tok nejdřív provozovat ručně jako službu, než se postaví.
- Odpovědnost za SMS/AI slib (zákon o el. komunikacích) řeší jen B.

---

# Verdikt předsedy

## Kde se council shoduje

1. **96 položek je špatná jednotka.** Pilot nekupuje šíři katalogu. Kupuje jeden výsledek: „žádný lead nepropadne“. Cenu 3,5K/měs obhájí jen hero tok a servis, ne jádro CRM. Tohle řekli všichni, nejostřeji Myslitel od prvních principů.
2. **Hero tok neexistuje a je to jediná věc, na které záleží.** Jádro řetězu je #20 Příjem poptávky → #21 Zápis leadu → #22 Okamžitá AI odpověď → #28 Eskalace na člověka → #25 Notifikace makléři. Všech 5 poradců ho dává do první verze.
3. **Čtyři sliby jsou podmínkou vstupu, ne funkcemi navíc:** #11 Přihlášení a oddělení dat, #12 Export dat, #29 Schvalovací režim a #76 Smlouva + zpracovatelská smlouva. Shoda 5/5. #89 Data jsou makléřova je jen jiný název pro #11 a #12. #90 Kontrola před odesláním se kryje s #85 a #29.
4. **Pojistky #85, #87 a #88 patří do první verze.** Bez nich nejde vyvrátit obavy č. 1 a 9.
5. **Do pilotu patří #33 Ranní digest.** Stačí tupá verze: připomínky, nové leady a majitelé.
6. **Servis je produkt:** #78 Onboarding a #79 Revizní cally (5/5).
7. **Nikdy:** #19, #54, #91, #92, #93 (5/5). K tomu #14 Nemovitost z e-mailů, protože vyžaduje přístup do schránky a audit CASA (obava č. 2).
8. **Později:** celý blok 8 Kancelář, akvizice #43/#44, #35 Matching, #31, #32, #53, #84 a #94–96.
9. **Mikrostránky #48–52 teď ne.** Tady by Brokerly proti THEONu jen prohrálo.
10. **Prodejní nástroje nejsou kód:** #72–75, #77, #81 a #83 udělat jako Google Doc, Tally a ruční práci.
11. **V katalogu chybí tři věci:** monitoring výpadků (obava č. 6), plán odchodu klienta (obava č. 7) a měření slibu „2 minuty / 40+ h“.

## Kde se council rozchází

- **Šíře první verze (10 vs. 20 vs. 35 položek).** Kontrarián a Exekutor chtějí minimum a pořadí stavby. Expanzionista přidává #55, #64 a #13 a nové produkty. Důvod sporu: Expanzionista optimalizuje pro tržby a wow efekt, ostatní pro to, že dva lidé mají 3 měsíce skluz. Recenze daly 4:1 za úzkou variantu.
- **#37 Follow-up majitelů v pilotu.** Kontrarián ho chce až do V1.1, protože bez fungujícího hero toku nikdo nepozná, že funguje. Ostatní ho chtějí hned, protože jinak Brokerly prodává jen opožděnou kopii USA. Obojí dává smysl. Rozhodující je, že jednoduchá verze (připomínky v CRM a digest) je skoro zadarmo.
- **#23, #26, #27 jako kód, nebo ručně.** Myslitel je chce všechny postavit. Exekutor chce #23 a #26 dělat ručně nebo přes kalendář. Spor je o kapacitu, ne o hodnotu.
- **#13 Hlasový zápis.** Expanzionista ho bere, protože je nejviditelnější. Exekutor ho bere levně jako diktování v telefonu. Ostatní ho odkládají, protože neřeší denní bolest.
- **#64 Balíček „inzerát komplet“ jako první peníze.** Pro je Expanzionista: cash dřív než hero tok. Proti jsou všichni ostatní: je to jiný byznys a jiné marže.
- **#80 Report hodnoty.** Myslitel ho chce velmi brzy kvůli obavě č. 10. Kontrarián a Exekutor až po prvních číslech, ručně.
- **Anonymizovaná data napříč klienty.** Expanzionista je chce. Tři recenzenti upozornili, že to přímo porušuje slib oddělení dat (obava č. 4). Tento spor je rozhodnutý: ne.

## Slepá místa, která council odhalil

1. **Kapacita dvou lidí.** Nikdo neodhadl pracnost, termín ani to, co vyhodit, když se to nestihne. Ani to, kdo z Ondřeje a Filipa co staví. Filip je single point of failure.
2. **Pilot bez kódu (Wizard of Oz / concierge).** Hero tok lze provozovat ručně: Dorina přeposílá poptávky a vy odpovídáte s pomocí AI. Hodnota se tak ověří za týdny místo měsíců. Nenavrhl to žádný poradce, vyplynulo to až z recenzí.
3. **Legalita a podmínky přeposílání ze Sreality (obava č. 5).** Všichni řešili jen, jestli jde e-mail parsovat. Nikdo neřešil, jestli to portál dovolí a jak reaguje na automatické odpovědi.
4. **Podíl poptávek ze Sreality u Doriny.** Ptal se jen Kontrarián. Je to předpoklad celého produktu a nikdo ho neověřil.
5. **Cena pilotu a ochota platit.** Ceník 40K + 3,5K je neověřený. Jeden pilot (n=1) nic nedokazuje. Chybí předprodej nebo smlouva o záměru a chybí kill kritérium pilotu.
6. **Odpovědnost za slib AI a za SMS.** Jde o zákon o elektronických komunikacích, souhlasy a STOP. Řeší se jen jako položka, ne jako rozhodnutí o autonomii.
7. **Wedge bez hero toku.** Digest a follow-up majitelů lze prodávat dřív, protože jsou nejméně rizikové. Zmínil to jen Expanzionista v recenzi.

## Doporučení

**První placená verze = hero tok v jednoduché podobě se schvalováním, plus čtyři sliby, digest a jednoduchý follow-up majitelů. Celkem zhruba 20 položek, nic víc.** Většina má pravdu a Expanzionistův rozsah je při 3měsíčním skluzu a dvou lidech chyba.

Podstatnější je ale pořadí, které žádný poradce sám neřekl: **nestavte hero tok, dokud ho týden neprovozujete ručně na Dorině.** Ověříte tím tři věci, bez kterých je stavba hazard:

- kolik jejích poptávek skutečně chodí přes Sreality,
- jestli jde přeposílání parsovat a je to v souladu s podmínkami portálu,
- jestli ji odpověď do 2 minut opravdu zajímá.

Dorina má být **design partner se slevou** výměnou za case study, ne zákaznice za 40K. Ceník ověřte až na druhém a třetím klientovi.

Pořadí stavby po ručním týdnu:

1. #11 + #12
2. #20 → #21 → #22 → #29 → #28
3. #25 jako SMS jen makléři a #24 jako odkaz na její kalendář
4. #33 digest
5. #27 a #37

Kvalifikaci #23 posoudí makléř z notifikace a #26 obstará jeho kalendář. Do pilotu nepouštějte nic jiného z katalogu.

## První krok

Tento týden si vyžádat od Doriny její skutečné poptávkové e-maily za poslední měsíc. Spočítat, kolik je jich ze Sreality, a jeden z nich ručně proměnit v kontakt a obchod v CRM. Pokud to nepůjde, nemá smysl stavět nic dalšího.

## Tabulka všech 96 položek

| # | Položka | Verdikt | Důvod |
|---|---|---|---|
| 1 | Kontakty | teď | Hotové jádro, na něm stojí vše. |
| 2 | Nemovitosti | teď | Karta je jediný zdroj pro AI odpovědi. |
| 3 | Obchody — kanban | teď | Hotové, hero tok do něj zapisuje. |
| 4 | Aktivity a připomínky | teď | Hotové, základ digestu i stopy. |
| 5 | Nastavení asistenta | teď | Tón a podpis potřebuje AI odpověď. |
| 6 | Dashboard | teď | Dodělat, nebo skrýt data natvrdo; nesmí lhát. |
| 7 | Import inzerátu z portálu | teď | Nejsilnější prodejní moment v demu. |
| 8 | Fotky a dokumenty | teď | Hotové, nic nového. |
| 9 | Provize a náklady | teď | Hotové, nerozšiřovat. |
| 10 | Hledání a filtry | teď | Hotové, nerozšiřovat. |
| 11 | Přihlášení a oddělení dat | teď / beru | Podmínka před prvním klientem, obava č. 4. |
| 12 | Export dat jedním tlačítkem | teď / beru | Levné a ruší obavu č. 4 a 7. |
| 13 | Hlasový zápis | později / později | Efektní, ale neřeší hlavní bolest; zatím diktování telefonem. |
| 14 | Nemovitost z e-mailů a příloh | nikdy / neberu | Přístup do schránky, audit CASA, obava č. 2. |
| 15 | Skóre zájemce podle chování | nikdy / neberu | Bez trackingu a objemu dat nemá z čeho skórovat. |
| 16 | Hlídání obchodu po rezervaci | později / později | Málo obchodů, makléř to ví sám. |
| 17 | Archivace | nikdy / neberu | Stačí filtr podle stavu. |
| 18 | Mobilní aplikace | později | Responzivní web stačí. |
| 19 | Export na portály | nikdy | Poski/Realman vyhrávají, my přijímáme. |
| 20 | Příjem poptávky | teď | Začátek hero toku; největší technické riziko. |
| 21 | Zápis leadu | teď | Bez něj není tok ani stopa. |
| 22 | Okamžitá AI odpověď | teď | Srdce produktu, se schvalováním. |
| 23 | Kvalifikace A / B / C | teď | Zatím jen otázky; posoudí makléř v notifikaci. |
| 24 | Rezervace prohlídky | teď | Stačí odkaz na kalendář makléře. |
| 25 | Notifikace makléři | teď | SMS jen makléři, jinak lead propadne. |
| 26 | SMS připomínky | později | Zatím je obstará kalendář; řešit souhlasy a STOP. |
| 27 | Follow-up po prohlídce | teď | Jednoduchá zpráva se schválením. |
| 28 | Eskalace na člověka | teď | Pojistka proti obavám č. 1 a 9. |
| 29 | Schvalovací režim | teď / beru | Bez něj Dorina AI ke klientům nepustí. |
| 30 | Ověření leadu | později / později | Zpomaluje slib odpovědi do 2 minut. |
| 31 | Kvalifikace proti turistům | později | Až když poběží rezervace ve větším objemu. |
| 32 | Hlasová AI | později | Drahá a riziková, obava č. 3. |
| 33 | Ranní digest | teď | Tvář produktu; první verze = e-mail ze dvou dotazů. |
| 34 | Komu zavolat a proč | teď / beru | Jen jako jedna věta v digestu, bez „co říct“. |
| 35 | Matching | později | Ruční „Možní zájemci“ stačí. |
| 36 | Dvoustranné párování | později / později | Sloučit s #35, makléř rozdíl nepozná. |
| 37 | Follow-up majitelů | teď | Moat; jednoduše přes připomínky a digest. |
| 38 | Signály | později / později | Sloučit s #35 a #37 později. |
| 39 | Týdenní report majiteli | později / později | Silné pro moat, ale až po #37. |
| 40 | Sběr podkladů od majitelů | později | Mimo hero tok. |
| 41 | Triáž schránky | později | Audit Googlu, obava č. 2. |
| 42 | Kontrola podkladů před nabídkou | později / později | Malý produkt navíc. |
| 43 | Monitoring samoprodejců | později | Tarif MAKLÉŘ+, právní riziko scrapingu. |
| 44 | Alert na expirované inzeráty | později | Spolu s #43. |
| 45 | Skóre náboru | později / později | Až po #43, MyLeady to umí. |
| 46 | AI příprava oslovení | později / později | Až po #43, makléř odesílá sám. |
| 47 | AI odhad ceny jako lead magnet | později / později | Velký potenciál, ale právní riziko odhadu. |
| 48 | Nabídka nemovitosti (mikrostránka) | nikdy / neberu | Inzerát je na Sreality; hřiště THEONu. |
| 49 | Rezervace / prohlídkový den | později / později | Teď stačí odkaz z #24. |
| 50 | Chci prodat | později / později | Sloučit s #47. |
| 51 | Vizitka makléře | nikdy / neberu | Patří Ondřejově agentuře, ne produktu. |
| 52 | Doporučení s atribucí | později / později | Laciné, ale až budou spokojení klienti. |
| 53 | Klientský portál se stavem obchodu | později | Mimo hero tok. |
| 54 | Web makléře s IDX/SEO | nikdy | Dělá agentura mimo produkt. |
| 55 | Žádost o Google recenzi | později | Triviální, přidat po prvním předání. |
| 56 | Výroční zpráva + doporučení | později | Smysl dává až za rok. |
| 57 | Narozeniny a svátky | nikdy / neberu | Šum, riziko „poznají robota“. |
| 58 | Zpráva o hodnotě bytu | později / později | Patří do cenových zpráv #37. |
| 59 | Program doporučení | nikdy / neberu | Šum, nízká páka. |
| 60 | 2D / 3D půdorys | později | Jiný byznys; zatím ruční zakázka. |
| 61 | Virtual staging | později | Jiný byznys; zatím ruční zakázka. |
| 62 | Renovační vizualizace | později | Jiný byznys. |
| 63 | Popisek + překlady | později | AI popisky má každý. |
| 64 | Balíček „inzerát komplet“ | později | Ruční servis na objednávku, ne vývoj. |
| 65 | Platba za variantu | později / později | Až bude AI Studio produktem. |
| 66 | Úprava fotek | nikdy / neberu | Komodita, nízká páka. |
| 67 | Distribuce leadů s eskalací | později | Fáze kanceláří. |
| 68 | Reporting vedení | později | Fáze kanceláří. |
| 69 | Skóre týdne | později | Fáze kanceláří, kopie THEONu. |
| 70 | Dotazy na vlastní data | později | Fáze kanceláří. |
| 71 | Nábor makléřů | později | Fáze kanceláří, nízká priorita. |
| 72 | Prezentace v pěti krocích | teď | Prodej; dokument, ne kód. |
| 73 | Demo účet | teď / beru | Živá ukázka s jejím importovaným inzerátem. |
| 74 | Interaktivní dotazník | teď / beru | Tally a diktování, žádný vývoj. |
| 75 | Plán na míru | teď / beru | Ručně v dokumentu. |
| 76 | Smlouva + zpracovatelská smlouva | teď | Slib č. 4; šablona od právníka, včetně odpovědnosti AI. |
| 77 | Fakturace 50 / 50 + měsíčně | teď / beru | Blokér; rozhodnout s Filipem tento týden. |
| 78 | Onboarding za 20 minut | teď | Servis je produkt. |
| 79 | Revizní cally | teď | Ladění je to, za co se platí. |
| 80 | Report hodnoty | později / později | Nejdřív měřit; první report ručně po čtvrtletí. |
| 81 | Složka klienta | teď | Jeden dokument, podklad pro upsell. |
| 82 | Web brokerly.cz | teď / beru | Jednostránka pro důvěru, ne víc. |
| 83 | Case study šablona | později / později | Až bude první klient s čísly. |
| 84 | Testovací verze a online předplatné | později | Až budeme známí. |
| 85 | AI odpovídá jen z karty | teď | Hlavní pojistka proti halucinaci. |
| 86 | Nikdy sám neoslovuje majitele | teď | Pravidlo a smluvní bod, nulový kód. |
| 87 | Nejistota = notifikace, nikdy spam | teď | Chrání důvěru makléře. |
| 88 | Každá akce zanechá stopu | teď | Máme; z ní vznikne měření hodnoty. |
| 89 | Data jsou makléřova | teď / beru | Splní se přes #11 a #12; sloučit. |
| 90 | Kontrola před odesláním | teď / beru | Pravidla v promptu a schvalování; sloučit s #85. |
| 91 | Chatbot v aplikaci | nikdy | ChatGPT to dělá. |
| 92 | E-podpis, katastr, AML, lustrace | nikdy | Hra velkých CRM. |
| 93 | Online aukce, MLS, sdílení nabídek | nikdy | Jiný byznys. |
| 94 | Smlouvy + e-podpis z dat obchodu | později | Až po hero toku. |
| 95 | Predikce příjmu | později | Málo dat u sólo makléře. |
| 96 | WhatsApp jako kanál | později | Placené Business API; nejdřív SMS. |

## Co v katalogu chybí

1. **Ověření přeposílání ze Sreality: parser a podmínky portálu.** Celý produkt stojí na tom, že formát půjde číst a portál to nezablokuje (obava č. 5). Dnes je to jen řádek #20.
2. **Ruční („concierge“) provoz hero toku jako první fáze pilotu.** Ověří hodnotu za týden místo tří měsíců vývoje.
3. **Monitoring výpadků a záložní režim.** Když přeposílání nebo AI spadne, makléř dostane upozornění místo ticha (obava č. 6).
4. **Měření reakčního času a ušetřených hodin.** Bez něj nejde doložit „2 minuty“, „40+ h“ ani obhájit 3,5K/měs (obava č. 10).
5. **Kritéria úspěchu a ukončení pilotu, plus cena pilotu.** Bez nich se nepozná, jestli pilot uspěl. Navržené kritérium: jeden zachráněný lead = 135K. Dorina jako design partner se slevou za case study.
6. **Odpovědnost za slib AI ve smlouvě.** Chybí v #76 a je to obava č. 9.
7. **Souhlasy, STOP a odhlášení u SMS a e-mailů.** Zákon o elektronických komunikacích a GDPR u leadu, ověřit právně před prvním klientem.
8. **Odchod klienta a předání dat.** Obava č. 7; doplňuje #12.
9. **Kapacitní plán Ondřej/Filip.** Kdo co staví, kolik týdnů, co se škrtá při skluzu.
10. **Zachycení leadů mimo portál.** Minimálně zmeškaný hovor → SMS, protože hero tok dnes předpokládá jediný kanál. Až po pilotu.
11. **Reaktivace staré databáze při setupu.** Levný okamžitý efekt v kroku 7 a přirozený předstupeň #37. Až po pilotu.
12. **Hypoteční poradce jako partner u kvalifikace.** Možný zdroj příjmu, ale až budou klienti.

Anonymizovaná tržní data napříč klienty council zamítá, protože porušují slib oddělení dat.

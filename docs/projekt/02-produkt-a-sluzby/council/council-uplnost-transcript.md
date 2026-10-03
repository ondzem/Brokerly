# Council — úplnost katalogu služeb Brokerly (přepis)

Datum: 2. 10. 2026 · Poradci a recenzenti: Claude Sonnet · Předseda: Claude Opus · Metodika: LLM Council (Karpathy), skill `.claude/skills/llm-council/SKILL.md`. Druhý council nad katalogem; první (teď / později / nikdy) je v `council-transcript-2026-10-02.md`.

## Původní otázka (Ondřej)
Kontrola úplnosti katalogu služeb a systémů, ne rozdělení na teď / později / nikdy. Vstup: vstup.md + 01 Mise a vize + cesta klienta + 10 obav, vložený přímo do zadání poradců.

## Framovaná otázka
„Je katalog služeb a systémů Brokerly úplný vzhledem k tomu, co slibujeme? Tedy asistent, který jedná za makléře, done-for-you služba, 10 kroků cesty klienta a odpovědi na 10 obav makléřů. Které služby nebo systémy chybí, které se překrývají a dají se sloučit a které jsou navíc?"

Kompletní vstup předaný poradcům: [`vstup-uplnost.md`](vstup-uplnost.md). Výstup: [`../sluzby-katalog-v2.html`](../sluzby-katalog-v2.html).

---

# Odpovědi poradců — úplnost katalogu

## Kontrarián
## 1. CHYBÍ

- **Měření a čítač hodnoty od prvního dne** (slib „40+ h měsíčně", obava č. 10, kroky 8–9). Report hodnoty (#80) je ŽLUTÁ, ale chybí samotný systém, který sbírá reakční čas, propadlé leady a ušetřené hodiny. Bez něj nejde ověřit cenu ani doložit případovku.
- **Monitoring selhání a stavová kontrola automatizací** (obava č. 6 „vypadne to a lead propadne"). #88 Každá akce zanechá stopu jen zapisuje, co proběhlo. Nikdo nehlídá, co neproběhlo (spadlý forward, prázdný příjem, mrtvý scraper). Digest #33 to nenahradí.
- **Odvolání souhlasu, STOP a výmaz dat zájemců** (obavy č. 2, 4, 9, slib GDPR). Je tu jen zápis souhlasu v #1 a smlouva #76. Chybí právo na výmaz, opt-out ze SMS i follow-upu a retence. SMS #26 bez opt-outu je právní riziko.
- **Pojistka proti ztrátě leadu při výpadku příjmu** (slib „žádný lead nepropadne"). #20 Příjem poptávky závisí na přeposlaném e-mailu. Chybí kontrola, že forward funguje, a záloha v podobě ručního zadání nebo importu poptávky.
- **Zpětná vazba a ladění AI** (krok 8, obava č. 3). Chybí způsob, jak makléř opravuje odpovědi a jak se z oprav učí tón. Ukázky tónu jsou jen v #5, revizní cally (#79) jsou ruční.
- **Vyjednávání a odpovědnost pro obavu č. 9.** #90 Kontrola před odesláním existuje, ale neexistuje auditní log „co AI napsala a proč" čitelný pro makléře. Tvrzení „systém dává záznam všeho" tak nemá oporu.
- **Offboarding (odchod klienta)** (poznámka ke všem krokům: „klient může odejít kdykoli"). Existuje export (#12), ale ne proces: zrušení přístupů, smazání dat, ukončení SMS.
- **Přeposílání poptávek na onboardingu** (krok 7). #78 Onboarding za 20 minut je jedna položka, ale kryje checklist, import tónu i přeposílání. Chybí samostatný napojovač portálových e-mailů (Sreality, Bezrealitky atd.). Parsování různých formátů je největší technické riziko hero toku.
- **Kvalifikační vrstva pro krok 2** (kvalifikace 3+ inzerátů). Nic v katalogu nepodporuje prodej samotný, jen leady makléřů. Chybí evidence našich leadů (call-centrum, doporučení). Dogfooding vlastním CRM by byl nejlepší demo.

## 2. PŘEKRÝVÁ SE

- **#49 Rezervace / prohlídkový den + #24 Rezervace prohlídky** je jedna stránka. Sloučit.
- **#36 Dvoustranné párování + #35 Matching** je jeden systém, jen obousměrný. Sloučit.
- **#12 Export dat + #89 Data jsou makléřova + #11 Přihlášení a oddělení dat** jsou jeden slib (obava č. 4). Je to jedno pravidlo se třemi částmi, ne tři položky.
- **#50 Chci prodat + #47 AI odhad ceny jako lead magnet** je totéž (vstup pro majitele). Sloučit.
- **#80 Report hodnoty + #39 Týdenní report majiteli + #68 Reporting vedení** jsou tři reporty nad stejnými daty. Sloučit na jeden generátor reportů.
- **#55 Žádost o Google recenzi + #56 Výroční zpráva + #57 Narozeniny + #58 Zpráva o hodnotě bytu** jsou jeden mechanismus (časově spouštěná zpráva bývalému klientovi), čtyři šablony.
- **#85 AI odpovídá jen z karty + #87 Nejistota = notifikace + #28 Eskalace na člověka + #90 Kontrola před odesláním** jsou vrstvy jedné pojistky. Hrozí, že se postaví čtyřikrát.
- **#33 Ranní digest + #34 Komu zavolat a proč** je jedna věc.
- **#73 Demo účet + #7 Import inzerátu** jsou propojené. Demo = import jeho inzerátu.

## 3. NAVÍC (nepatří k žádnému slibu ani obavě)

- **#57 Narozeniny a svátky**: nesouvisí se žádným slibem ani obavou.
- **#69 Skóre týdne, #71 Nábor makléřů, #95 Predikce příjmu, #70 Dotazy na vlastní data**: kancelářská fáze 2, není to cílovka. Do hlavního katalogu nepatří, ať neodvádí pozornost.
- **#16 Hlídání obchodu po rezervaci a #42 Kontrola podkladů před nabídkou**: žádná z 10 obav ani žádný krok na ně neukazuje.
- **#17 Archivace**: údržba, ne slib.
- **#53 Klientský portál, #94 Smlouvy + e-podpis, #92 E-podpis/katastr/AML**: duplicitní s „nedělat". Smlouvy (#94) se navíc přímo kříží s #92.
- **#82 Web brokerly.cz a #83 Case study šablona**: marketing, ne produkt. Patří jinam (ozeman.cz), do katalogu služeb ne.
- **#51 Vizitka makléře, #52 Doporučení s atribucí**: nesplňují hero tok ani žádnou obavu. Doporučení (krok 10) kryje #59.
- **#60–#66 AI Studio** (7 položek) je samostatný byznys. Nesouvisí s asistentem, který jedná za makléře. Je to cross-sell, ne součást slibu.

**Hlavní díra:** katalog je plný „chceme" funkcí, ale slabý právě tam, kde stojí důvěra: měření, monitoring výpadků, GDPR opt-out a audit. Přitom právě tyto věci jsou „podmínkou před prvním klientem".

## Myslitel od prvních principů
## 1. CHYBÍ

- **Příjem poptávky z jiných kanálů než e-mail z portálu** (k #20 Příjem poptávky; slib „žádný lead nepropadne", krok 1 Lead): poptávky chodí i telefonem, přes web a z WhatsAppu/Messengeru. Hero tok je postavený jen na přeposlaném e-mailu, takže lead mimo něj propadne.
- **Monitoring výpadků a zdraví automatizace** (obava 6 „vypadne to a lead propadne"; #87 Nejistota = notifikace): žádná položka nehlídá, že přeposílání, SMS brána nebo scraper stojí. #88 Stopa jen zapisuje, nehlídá. Je potřeba heartbeat, alarm „dnes nepřišla žádná poptávka" a runbook pro nás.
- **Provozní servis a podpora** (slib done-for-you „provozujeme"; obava 7 závislost): chybí SLA, support kanál, oprava rozbitého scraperu nebo změny portálu. #79 Revizní cally jsou jen plánované, ne reaktivní.
- **Offboarding a ukončení spolupráce** (krok 6 „co se stane, když řekne ne"; obava 4): export (#12) je jen tlačítko. Chybí proces odchodu, mazání dat a výpovědní lhůty.
- **Audit log a důkaz pro odpovědnost** (obava 9): #88 je stopa v CRM, ale ne nezměnitelný záznam „co AI poslala a z jakého pole karty". Právě ten je obranou, když AI něco slíbí.
- **Správa souhlasů a odhlášení (opt-out)** (obava 1, 3; #26 STOP): STOP funguje jen u SMS. Chybí globální opt-out a evidence marketingového souhlasu pro follow-upy (#27, #37, #55–#57).
- **Zaškolení, dokumentace a nápověda** (obava 7; krok 7–8): onboarding trvá 20 minut, ale nic nenaučí makléře Nastavení ani digest číst.
- **Zdroj ID inzerátu pro párování** (#21): párování leadu na nemovitost závisí na tom, že nemovitost je v systému. U aktivních inzerátů proto chybí průběžná synchronizace, ne jen jednorázový #7 import.
- **Měření ROI od prvního dne** (obava 10, krok 8–9): sliby jsou „měřit od dne 1", ale #80 Report hodnoty je ŽLUTÁ a nic nesbírá základní metriky (reakční čas před a po).

## 2. PŘEKRÝVÁ SE

- **#11 Přihlášení a oddělení dat + #89 Data jsou makléřova + #12 Export** → jeden balíček „Vlastnictví dat". Je to tentýž slib (obava 4) ve třech položkách.
- **#29 Schvalovací režim + #90 Kontrola před odesláním + #85 AI odpovídá jen z karty + #87 Nejistota = notifikace** → jedna „vrstva bezpečnosti AI" (obava 1, 9). Dnes jsou rozdělené mezi hero tok a pravidla.
- **#48 + #49 + #50 + #51** → jedna mikrostránka s bloky. #49 je explicitně tatáž stránka jako rezervace z #24.
- **#35 Matching + #36 Dvoustranné párování** → jedna funkce, dva směry.
- **#33 Ranní digest + #34 Komu zavolat a proč + #38 Signály** → #34 a #38 jsou obsah digestu, ne samostatné systémy.
- **#43 + #44 + #45 + #46** → jeden akviziční pipeline: sběr, skóre, příprava oslovení.
- **#72 + #73 + #75 + #83** → #73 Demo účet je nástroj #72 Prezentace, #83 Case study navazuje na #80 Report hodnoty.
- **#76 Smlouva + #94 Smlouvy z dat obchodu** a **#47 Odhad ceny + #50 Chci prodat + #58 Zpráva o hodnotě** → jeden odhadový motor.

## 3. NAVÍC

- **#69 Skóre týdne, #70 Dotazy na vlastní data, #71 Nábor makléřů, #95 Predikce příjmu**: neplynou z žádného slibu ani obavy sólo makléře, jsou to zdobení kancelářského segmentu nebo kopie konkurence.
- **#57 Narozeniny a svátky**: není z žádného z 10 kroků ani obav, jde jen o kopii THEON.
- **#16 Hlídání obchodu po rezervaci a #15 Skóre zájemce podle chování**: sliby jsou před prohlídkou (kvalifikace A/B/C), ne po rezervaci a ne podle chování v e-mailu.
- **#14 Nemovitost z e-mailů** a **#41 Triáž schránky**: odporují obavě 2 a rozhodnutí „start přes přeposílání".
- **#66 Úprava fotek, #65 Platba za variantu**: AI Studio nemá žádný slib mezi 10 obavami, je to jen vedlejší obchod.
- **#82 Web brokerly.cz**: patří do kroku 3 (prodej), ne do produktu.

Hlavní závěr: katalog je úplný pro funkce, ale neúplný pro důvěru a provoz. Sliby „jedná za tebe" a „done-for-you" stojí na monitoringu, audit logu, offboardingu a podpoře, které v 96 položkách nejsou.

## Expanzionista
## 1. CHYBÍ

- **Napojení na cizí CRM (stret.ai, Raynet, Tabidoo)** – původní slib „nasadíme vrstvu na tvoje CRM" nemá v katalogu žádnou položku. Přitom je to nejlevnější vstup do trhu: nulové stěhování dat, kratší krok 7. Patří k misi i obavě č. 7 (závislost).
- **Správa kalendáře makléře (obousměrná synchronizace Google/Outlook)** – položka 24 Rezervace prohlídky ji předpokládá, ale jako systém nikde neexistuje. Bez ní dochází ke dvojím rezervacím, a to rozbije obavu č. 8 (no-show) i č. 6 (výpadek).
- **Monitoring provozu a self-healing** – obava č. 6 slibuje „nepropadne ticho", ale žádná položka nehlídá, jestli automatizace žije (heartbeat, fronta selhání, alert Filipovi). Je to podmínka pro slib „žádný lead nepropadne".
- **Měření času a hodnoty od prvního dne** – obava č. 10 a krok 8 to chtějí, katalog má jen 80 Report hodnoty (čtvrtletně). Chybí živý počítadlo „ušetřené hodiny / zachráněné leady", které prodává i upsell.
- **Vymezení odpovědnosti a pojištění (obava č. 9)** – 76 Smlouva řeší rozsah, ale chybí produkt „log všeho, co AI řekla" jako dohledatelný důkaz a případně pojištění odpovědnosti jako obchodní argument.
- **Offboarding a „co se stane, když řekneš ne"** – obava č. 7 a závěr cesty klienta. Chybí proces odchodu: export + smazání dat + potvrzení.
- **Call-centrum jako produkt** – krok 1 stojí na navolávání, ale v katalogu není scénář, skript, CRM pro prospekci vlastního prodeje. Brokerly nemá vlastní lead-gen CRM.
- **Instalace a škola pro jejich klienty / přeposílání poptávek** – 78 Onboarding za 20 minut neřeší průvodce nastavení filtrů v Gmailu a Seznamu pro 20 typů portálových e-mailů (krok 7).
- **Reaktivace studené databáze** – makléř má stovky mrtvých kontaktů (problém č. 2). Chybí jednorázová kampaň „probuď databázi" jako rychlý first win v kroku 8.
- **Hypoteční a právní partneři (doporučovací marže)** – kupující s A/B skóre je lead pro hypotéčního poradce; 23 Kvalifikace ho už zná. Příjem z provizí je upside mimo předplatné.
- **Mezinárodní vrstva (pro cíl 10 000 globálně)** – lokalizace, jiné portály, jiné právo. Mezi položkami není nic.

## 2. PŘEKRÝVÁ SE

- **47 AI odhad ceny jako lead magnet + 50 Chci prodat** – jedna věc (odhad za kontakt); sloučit do jedné klientské stránky.
- **49 Rezervace / prohlídkový den + 24 Rezervace prohlídky** – jedna stránka, jeden systém.
- **12 Export dat + 89 Data jsou makléřova + 11 Přihlášení a oddělení dat** – jeden balík „vlastnictví dat" (tři slibové podmínky pro obavu č. 4).
- **29 Schvalovací režim + 90 Kontrola před odesláním + 85 AI odpovídá jen z karty** – jedna vrstva „ochrana odpovědi".
- **57 Narozeniny + 56 Výroční zpráva + 58 Zpráva o hodnotě bytu** – jeden program péče.
- **43, 44, 45, 46** – jedna akviziční linka, ne čtyři produkty.
- **74 Interaktivní dotazník + 75 Plán na míru + 72 Prezentace** – jedna prodejní osa kroků 3–5.
- **59 Program doporučení + 52 Doporučení s atribucí** – sloučit.
- **13 Hlasový zápis** je dvakrát v duchu s 74 (diktování); sdílet technologii.

## 3. NAVÍC

- **54 Web makléře**, **91 Chatbot v aplikaci**, **93 Online aukce/MLS** – už jsou „nedělat", nechat škrtnuté.
- **71 Nábor makléřů** – k žádnému slibu nepatří.
- **95 Predikce příjmu** – není v slibu ani obavě.
- **82 Web brokerly.cz** a **83 Case study šablona** jsou marketing, ne produkt; přesunout do plánu růstu.
- **18 Mobilní aplikace** – responzivní web stačí do pilotu.
- **66 Úprava fotek** – AI Studio nemá patřit do jádra slibu „jedná za tebe".

## Outsider
## 1. CHYBÍ

- **Slib „žádný lead nepropadne" / obava 6 (vypadne to):** není položka pro monitoring selhání automatizací ani nouzový režim. Pravidlo „nejistota = notifikace" (87) předpokládá, že systém běží. Kdo hlídá, že běží?
- **Slib „asistent jedná za tebe" + krok 7/8:** žádná položka pro napojení makléřova kalendáře, SMS brány ani přeposílací schránky. Rezervace (24) a SMS (26) na tom stojí, ale infrastruktura není v katalogu.
- **Obava 9 (kdo odpovídá):** je jen jako smluvní pravidlo v 76 a 86. Chybí položka „odpovědnost a záznam všeho", tedy čitelný audit log pro makléře. 88 je jen stopa v Aktivitách.
- **Obava 10 (vyplatí se to) a krok 8:** měření reakčního času a ušetřených hodin „od prvního dne" nemá položku. Je jen čtvrtletní Report hodnoty (80), ale měření samotné nikde není.
- **Obava 7 (závislost) a krok 8:** chybí odchod klienta (offboarding). Je to popsané jako „v každém kroku může odstoupit", ale žádná položka to neřeší.
- **Krok 1–2:** chybí kvalifikační skript a call-centrum jako služba. Je to zdroj leadů, ale v katalogu není vůbec.
- **Obava 3 (poznají robota):** učení tónu z ukázek je jen pole v 5 Nastavení. Není položka pro to, kdo a jak tón nastaví a ladí.
- **Obava 5 (Sreality):** žádná položka pro legální a technické ošetření scraperu (43, 44). Slibujete „jen čte", ale bezpečnost proti blokaci nikde není.

## 2. PŘEKRÝVÁ SE

- **11 Přihlášení a oddělení dat + 89 Data jsou makléřova + 12 Export dat:** tři názvy pro obavu 4. Sloučit do jedné položky „Data makléře" s exportem a izolací.
- **29 Schvalovací režim + 90 Kontrola před odesláním + 85 AI odpovídá jen z karty + 87 Nejistota = notifikace:** čtyři pojistky téhož (AI nesmí napsat blbost). Dvě skupiny: „co AI smí" (85, 90) a „co se stane při pochybnosti" (29, 87).
- **49 Rezervace/prohlídkový den + 24 Rezervace prohlídky:** katalog sám říká „stejná stránka". Je to jedna věc.
- **50 Chci prodat + 47 AI odhad ceny jako lead magnet:** stejný odhad ceny zdarma za kontakt.
- **55 Žádost o recenzi + 56 Výroční zpráva + 57 Narozeniny + 58 Zpráva o hodnotě bytu + 59 Program doporučení + 52 Doporučení s atribucí:** šest položek o péči a doporučeních, dají se spojit do 2–3.
- **35 Matching + 36 Dvoustranné párování:** jedna věc, jen obousměrná.
- **72 Prezentace + 73 Demo účet + 74 Dotazník + 75 Plán na míru:** čtyři kroky jednoho prodejního procesu. Dá se brát jako jedna položka „Prodejní proces".
- **80 Report hodnoty + 39 Týdenní report majiteli + 68 Reporting vedení:** tři reporty s různým adresátem, ale stejným principem.
- **94 Smlouvy + e-podpis a 92 E-podpis:** 92 říká „nedělat", 94 říká „později". Rozhodněte.
- **63 Popisek + překlady vs. 91 Chatbot:** AI popisky má „každý", přesto stojí v 63 jako „chceme". Odporuje to vlastní analýze.

## 3. NAVÍC

- **60–66 AI Studio (7 položek):** k žádnému ze čtyř slibů ani obav nepatří. Je to jiný produkt se samostatnou cenou a jiným zákazníkem.
- **69 Skóre týdne, 70 Dotazy na vlastní data, 71 Nábor makléřů, 95 Predikce příjmu:** nesouvisí se slibem pro sólo makléře ani s žádnou obavou.
- **53 Klientský portál:** kupující ani majitel nejsou naši klienti.
- **13 Hlasový zápis, 14 Nemovitost z e-mailů, 15 Skóre podle chování, 16 Hlídání po rezervaci, 17 Archivace:** inspirace od konkurence bez vazby na slib. 14 navíc odporuje obavě 2 (čtení schránky).
- **82 Web brokerly.cz, 83 Case study šablona:** marketing firmy, ne služba klientovi.
- **96 WhatsApp, 32 Hlasová AI, 31 Kvalifikace proti turistům:** 31 přitom odpovídá na obavu 8, takže je „později" špatně zařazené.

## Exekutor
## 1. CHYBÍ

- **Příjem a ověření poptávky z portálu v produkci (provozní proces, ne funkce):** u #20 Příjem poptávky chybí vyhrazená schránka/alias na klienta a návod na přeposílání pro Sreality, iDNES a Bezrealitky. Bez toho nejde odbavit krok 7 ani obava 5.
- **Monitoring výpadků a SLA (obava 6):** #88 Každá akce zanechá stopu jen zapisuje. Chybí hlídač „poptávka přišla a do 2 minut nic neodešlo", status stránka a incident runbook. Bez toho slib „nepropadne" nikdo neověří.
- **Fallback při selhání odeslání (obava 6):** SMS/e-mailová brána spadne, a chybí záložní cesta (např. push nebo volání makléři). #25 Notifikace makléři je jediná.
- **Odchod klienta (kroky 1–10, „co se stane, když řekne ne"):** chybí offboarding. Jde o proces odstoupení, vrácení části zálohy, smazání dat po exportu a vypnutí přeposílání. #12 Export dat je jen tlačítko.
- **Zásahy ve smlouvě (obava 9):** #76 Smlouva + zpracovatelská smlouva nemá položku pro odpovědnost a SLA. Chybí také seznam subdodavatelů (SMS brána, LLM, hosting) a DPA s nimi. Bez toho zpracovatelská smlouva nejde podepsat.
- **Spotřebitelský souhlas příjemců SMS (kroky 6–7):** #26 SMS připomínky a #56 Výroční zpráva nemají zdroj opt-inu ani evidenci STOP/odhlášení. U oslovování bývalých klientů jde o ePrivacy.
- **Sběr vzorků tónu (krok 7, obava 3):** je v kroku 7 jako [návrh], v katalogu nikde. Nastavení (#5) drží jen pole. Chybí postup „3 reálné e-maily → profil hlasu" a jeho testování.
- **Testovací sada AI odpovědí (obava 1):** #85 AI odpovídá jen z karty a #90 Kontrola před odesláním potřebují regresní sadu otázek a „zakázaných" odpovědí. Bez ní nejde ladit v kroku 8.
- **Měření hodnoty od dne 1 (obava 10, krok 9):** #80 Report hodnoty je čtvrtletní, ale chybí sběr metrik (reakční čas, propadlé leady, ušetřené hodiny) od startu a výchozí stav před nasazením.
- **Podpora a eskalační kanál klienta (obava 7):** chybí support (kontakt, doba reakce, kdo to bere, když je Ondřej nebo Filip nedostupný). Kapacita na 8–10 klientů je jedna osoba.
- **Sběr plateb a faktur (krok 6):** #77 Fakturace je jen rozhodnutí. Chybí systém, který vystaví fakturu, hlídá 50/50 a ruší službu při neplacení.
- **Call-centrum a skript (kroky 1–2):** chybí kvalifikační skript se třemi otázkami a evidence leadů před klientem. Krok 1–2 nemá žádnou položku.
- **Pilotní smlouva a cena (krok 5–6):** ceník je neověřený. Chybí pilotní nabídka se zárukou a podmínkami „ušetříme 40 h, jinak ne".

## 2. PŘEKRÝVÁ SE

- **#12 Export dat + #89 Data jsou makléřova + #11 Přihlášení a oddělení dat:** jedna položka „Data makléře" s podpoložkami (export, izolace, zákaz sekundárního použití).
- **#48 Nabídka nemovitosti + #49 Rezervace / prohlídkový den + #24 Rezervace prohlídky:** jedna stránka a jedna služba, #49 sám říká „stejná stránka".
- **#50 Chci prodat + #47 AI odhad ceny jako lead magnet:** totéž, sloučit.
- **#29 Schvalovací režim + #90 Kontrola před odesláním + #85 AI odpovídá jen z karty + #87 Nejistota = notifikace:** jedno „Bezpečnostní pravidla AI" se čtyřmi testovatelnými pojistkami.
- **#33 Ranní digest + #34 Komu zavolat a proč:** #34 je obsah digestu.
- **#35 Matching + #36 Dvoustranné párování:** jedna služba.
- **#55 Recenze + #56 Výročí + #57 Svátky + #58 Zpráva o hodnotě bytu:** jedna „péče o bývalé klienty" s různými spouštěči.
- **#56 Výroční zpráva + #59 Program doporučení + #52 Doporučení s atribucí:** jedno doporučení.
- **#74 Dotazník + #75 Plán na míru + #72 Prezentace:** jeden prodejní balíček.
- **#80 Report hodnoty + #39 Týdenní report majiteli:** stejná mechanika, jiný příjemce.

## 3. NAVÍC

- **#51 Vizitka makléře, #57 Narozeniny a svátky, #17 Archivace:** nikdo je nebude provozovat před prvním klientem.
- **#15 Skóre zájemce podle chování a #45 Skóre náboru:** vyžadují data, která v pilotu nebudou.
- **#14 Nemovitost z e-mailů:** konflikt s příslibem „nečteme schránku", nikdo to nechce.
- **#83 Case study šablona, #82 Web brokerly.cz (odložit jako mikrostránku bez funkcí):** obsah, ne systém.
- **#67–#71 Kancelář (celé), #53 Klientský portál, #94, #95, #96:** druhá fáze, v katalogu jen odvádějí pozornost.
- **#16 Hlídání obchodu po rezervaci a #42 Kontrola podkladů:** žádná obava ani krok je nevyžaduje.

---

# Recenze (anonymizace: A = Outsider · B = Expanzionista · C = Exekutor · D = Kontrarián · E = Myslitel od prvních principů)

## Recenzent: Kontrarián
**1. Nejsilnější: D.** Nejpřesněji pojmenovává jádro problému: katalog je plný „chceme" funkcí, ale slabý tam, kde stojí důvěra (měření, monitoring, GDPR opt-out, audit). Jako jediná zachytila i právo na výmaz a opt-out. Má taky nejlepší hlídání rozporů (#94 vs #92, #14 vs obava 2). C je těsně za ní, protože přidává DPA, subdodavatele a fakturaci.

**2. Největší slepé místo: B.** Navrhuje deset „chybí" položek včetně mezinárodní vrstvy, hypotečních partnerů a reaktivace databáze. To je rozšiřování katalogu, ne kontrola úplnosti vůči slibu. Chybí jí GDPR/opt-out a právní rámec. Zároveň jako jediná chce napojení na cizí CRM, což může být nejdůležitější strategická díra. Ostatní to zcela minuly. A silně žádá „více", ne škrtání.

**3. Přehlédly všechny:**
- Žádná odpověď neřeší pořadí ani závislosti. Katalog je „úplný" jen tehdy, když víme, co je nutné před prvním klientem. Chybí kritická cesta (MVP vs. později).
- Kapacita. Done-for-you pro 8–10 klientů drží jedna až dvě osoby. Úplnost katalogu je k ničemu bez provozní kapacity (C se jí dotkla jen okrajem).
- Ekonomika. Obava 10 („vyplatí se to") je cenová otázka. Nikdo nespočítal náklady na provoz (LLM, SMS, scraper) na klienta ani marži.
- Právní riziko Sreality a monitoringu (43–46). Scraping cizích portálů je jiné riziko než „jen čteme poštu". Obava 5 je zodpovězena jen jako funkce, ne jako právní postoj.
- Chybí validace. Žádný makléř zatím neřekl, že tyto položky chce. Kontrola úplnosti bez zpětné vazby z trhu je jen vnitřní konzistence.
- Metoda. Všichni jen opakují „sloučit stejné" a „kancelář je navíc". Nikdo nenavrhl pravidlo, podle kterého se položka do katalogu dostane (slib/obava/krok), a podle něj škrtat mechanicky.

## Recenzent: Myslitel od prvních principů
**1. Nejsilnější: D.** Jako jediná vidí strukturu problému: katalog je plný „chceme" funkcí, ale slabý tam, kde stojí důvěra. Jmenuje měření, monitoring výpadků, GDPR opt-out a audit. Navíc rozlišuje „hlídá, co neproběhlo" od „zapisuje, co proběhlo" a upozorňuje, že se pojistky postaví čtyřikrát. E je těsně za ní díky závěru „úplný pro funkce, neúplný pro provoz a důvěru".

**2. Největší slepé místo: B.** Dává deset „chybí" včetně mezinárodní vrstvy, pojištění a hypotečních partnerů. To je rozpínání katalogu, přesně opak otázky. Mezinárodní vrstva ani partnerské marže nevyplývají z žádného slibu ani obavy. Navíc mezi „navíc" řadí věci, které už jsou „nedělat". Chybí jí dělicí kritérium: slib nebo obava, jinak ven.

**3. Přehlédli všichni:**
- Žádná neověřila předpoklad „96 položek = jednotka měření". Nikdo nenavrhl mapu slib/obava/krok → položka, kde prázdná řádka znamená díru a položka bez řádku znamená přebytek. Bez ní je „úplnost" dojem.
- Nerozlišili funkci produktu od provozní schopnosti firmy. Done-for-you znamená lidi, runbooky, SLA a kapacitu (jedna osoba na 8–10 klientů). Katalog systémů to nezachytí. Jen C se toho dotkla.
- Nikdo nepoložil otázku pořadí. Nechybí „co přidat", ale co z toho musí existovat před prvním klientem. Úplnost bez priorit nepomůže.
- Obava 5 (Sreality) a obava 2 (čtení e-mailů) jsou právní/obchodní, ne funkční. Katalog je nevyřeší přidáním položky.

## Recenzent: Expanzionista
**1. Nejsilnější: E** (těsně před D). Nejlépe pojmenovává jádro: katalog je úplný pro funkce, ale ne pro důvěru a provoz. Navíc přidává dva body, které ostatní nemají: opt-out a souhlasy napříč kanály a průběžnou synchronizaci inzerátů. D má podobný závěr a navíc GDPR výmaz.

**2. Největší slepé místo: A.** Skoro celé „NAVÍC" je řez ve funkcích (AI Studio, portál, WhatsApp) a nic nenavrhuje. Hlavně škrtá věci s upsell potenciálem, například AI Studio, a nevidí žádný příjem navíc. Neřeší ani GDPR opt-out, provoz a podporu. B jediná myslí na růst (cizí CRM, hypotéky), ale rozbíhá se až k mezinárodní vrstvě.

**3. Co přehlédly všechny:**
- Ekonomika a kapacita: 8–10 klientů na jednoho člověka. Katalog nemá žádný „nástroj pro provozovatele" (multi-klientní dashboard, šablony nasazení, opakovatelný setup). Done-for-you se bez toho nedá škálovat. Jen C se kapacity dotkla okrajově.
- Napojení na stávající CRM jako vstupní produkt (zmínila jen B). Nemusí to být jen vstup, ale i nejlevnější způsob, jak snížit obavu 7.
- Příjem z partnerů: hypotéka, pojištění, právník. Je to potenciální druhý zdroj příjmu a z katalogu chybí. Zmínila ho jen B.
- Dogfooding a vlastní prodejní CRM: Brokerly nepoužívá vlastní produkt pro svůj lead-gen. D to zmiňuje jen jednou větou. Byla by to nejlepší případovka.
- Prioritizace: nikdo nepřevedl 96 položek na „před prvním klientem / po pilotu / později". Bez toho je i „úplný" katalog nepoužitelný.
- Pilotní záruka a cena: zmínila jen C. Je to nejsilnější odpověď na obavu 10.

## Recenzent: Outsider
**1. Nejsilnější: D.** Jako jediná shrnuje, co katalog dluží: důvěru a provoz (měření, monitoring, GDPR opt-out, audit). Má i jasný závěr, který čtenář bez kontextu pochopí. E je těsně za ní a má podobný závěr. A je nejpřesnější v překryvech, ale chybí jí syntéza.

**2. Největší slepé místo: B.** Přidává „mezinárodní vrstvu", „hypoteční partnery" a „napojení na cizí CRM". To jsou nové produkty, ne mezery vůči slibu. Chyba, ze které vychází: „úplnost" bere jako „co všechno by šlo přidat". B zároveň neřeší GDPR/opt-out a nesedí jí s ostatními ani zařazení. C je naopak přeplněná: 12 mezer bez priority, takže se ztrácí, co je podmínkou startu.

**3. Co přehlédly všechny:**
- Žádná odpověď neřekla, jak se „úplný" měří. Všechny porovnávaly 96 položek se sliby a hledaly díry, ale nikdo nenavrhl mapu slib → položka → stav (hotovo / chybí). Bez ní „úplný" nelze ověřit.
- Nikdo nezpochybnil počet 96. Po slučování, které navrhují všechny, by zůstalo možná 50–60 položek. Katalog je tedy spíš nepřehledný než nekompletní.
- Žádné pořadí. Co je podmínkou před prvním klientem a co ne? Pro tým o dvou lidech je to klíčové.
- Nikdo se nezeptal na kapacitu. Slib „done-for-you" při 8–10 klientech znamená, že provoz drží jedna osoba. Katalog to nijak neodráží.
- Termíny a zkratky (THEON, ŽLUTÁ, hero tok) použity bez vysvětlení. Čtenář bez kontextu je nepochopí.

## Recenzent: Exekutor
**1. Nejsilnější: C** a těsně **D**. C je nejkonkrétnější a nejproveditelnější: jmenuje provozní díry, bez kterých nejde podepsat smlouva ani spustit první klient (DPA a seznam subdodavatelů, opt-in a STOP u SMS, testovací sada AI odpovědí, fakturace, podpora při kapacitě jedné osoby). Každou lze udělat jako úkol s výstupem. D má nejlepší shrnutí: katalog je silný ve funkcích a slabý v důvěře (měření, monitoring, GDPR opt-out, audit). E to říká podobně.

**2. Největší slepé místo: B.** Přidává „mezinárodní vrstvu", partnerské marže z hypoték a napojení na cizí CRM. To jsou přání mimo slib a obavy. Chybí jí přitom právní a provozní základ (DPA, opt-out, fakturace). A má další slabinu: u položek „navíc" škrtá i #31 (kvalifikace proti turistům), která odpovídá na obavu 8, a sama si to protiřečí.

**3. Přehlédly všechny:**
- Pořadí a kapacita. Nikdo nesetřídil, co je podmínkou před prvním klientem a co přijde později. Doplněné díry (monitoring, audit log, offboarding, podpora, měření, DPA) jsou další práce pro 2 lidi. Katalog se tím nezmenší, spíš naroste. Nejdřív je potřeba škrtat a slučovat.
- Provozní zátěž na klienta. Nikdo nespočítal čas na jednoho klienta (scraper, ladění tónu, revize). Bez toho nejde říct, zda 8 až 10 klientů zvládne jedna osoba.
- Závislost na třetích stranách. Změny portálů, SMS brána, LLM poskytovatel a ceny nemají plán B.
- Vlastní katalog není produkt. Nikdo nerozlišil katalog pro klienta a interní provozní backlog.

---

# Verdikt předsedy

## Verdikt
- **Chybí 11 položek** (a 2 další patří do odložených). Katalog pokrývá funkce, ale ne to, na čem stojí důvěra a provoz. Na sliby „jedná za tebe" a „done-for-you" proto zatím úplný není.
- Díra je ve třech oblastech. **Hlídání provozu:** nic nekontroluje, co se neudálo (obava 6). **Důvěra a právo:** chybí auditní log AI, souhlasy a STOP, DPA se subdodavateli a odchod klienta (obavy 2, 4, 7, 9). **Měření od 1. dne:** bez něj nemá čtvrtletní report čísla (obava 10). Na tom se shodlo všech 5 poradců.
- Čtyři sliby, které dáváme (#29 Schvalovací režim, #11 Přihlášení a oddělení dat, #12 Export, #89 Data jsou makléřova), stojí v katalogu jako ŽLUTÁ, tedy nerozhodnuto. To je vnitřní rozpor: co slibujeme v prodeji, nemůže být „inspirace z konkurence".
- Sloučením 21 položek a vyřazením 12 se katalog zmenší z 96 zhruba na 74 i s novými položkami. Za hlavní problém pokládám spíš nepřehlednost než mezery. Pojistky AI (#29, #85, #87, #90) by se jinak stavěly čtyřikrát.
- Council přehlédl dvě věci. Chybí dělicí pravidlo: mapa slib/krok/obava → položka, kde prázdný řádek je díra a položka bez řádku přebytek. Chybí i rozlišení mezi funkcí produktu a provozní schopností firmy (runbook, podpora, DPA), přitom obě sedí v jednom seznamu. Navíc nikdo neseřadil, co je potřeba pro pilot s Dorinou, a nikdo nespočítal náklady na klienta (LLM, SMS, scraper).

## Kde se council shoduje
- **Monitoring výpadků:** shoda 5/5. #88 zapisuje, co se stalo. Nikdo nehlídá spadlý forward, prázdný příjem ani mrtvý scraper.
- **Měření od dne 1:** shoda 5/5. #80 je jen výstup, chybí sběr dat a výchozí stav před nasazením.
- **Offboarding:** shoda 5/5. Klient může odejít v každém kroku, ale postup odchodu neexistuje.
- **Auditní log AI:** shoda 4/5. Má být čitelný pro makléře: co AI poslala, z jakého pole karty a kdo to schválil.
- **Infrastruktura příjmu poptávek:** shoda 4/5. Patří sem schránka na klienta, parsování formátů portálů a návod na přeposílání. Na tom stojí #20.
- **Sloučení, na kterých je shoda:** #11+#12+#89 (5/5), #29+#85+#87+#90 (4/5), #24+#49, #47+#50, #35+#36, prodejní proces #72–#75, péče #55/#56/#58.
- **Navíc:** #95 Predikce příjmu, #71 Nábor makléřů, #82/#83 (marketing Brokerly, ne služba makléři) a #16 Hlídání obchodu po rezervaci.

## Kde se council rozchází
- **AI Studio (#60–#66):** Kontrarián a Outsider ho chtějí vyřadit jako jiný byznys. Expanzionista v něm vidí upsell. Rozhodnutí: nechat ho jako oddělenou produktovou linii, ale do úplnosti vůči slibům ho nepočítat.
- **Napojení na cizí CRM:** přišlo jen od Expanzionisty. Kontrarián v recenzi ho přesto označil za možná nejdůležitější strategickou díru, protože to byl původní slib a lék na obavu 7. Zatím nerozhodnuto, proto je v odložených.
- **Kancelář (#67–#70):** většina by ji škrtla. Je ale vědomě vedená jako pozdější segment, takže zůstává ve stavu „později".
- **Péče o klienty:** Outsider chtěl sloučit šest položek. Většina místo toho #57 Narozeniny vyřazuje a zbytek slučuje do dvou položek.
- **#94 vs #92:** Myslitel #94 slučoval s #76, ostatní upozorňují na rozpor s #92 „nedělat". Rozhodnutí: vyřadit.
- **Exekutor** dodal nejvíc konkrétních mezer (DPA, testovací sada, podpora, fakturace), ale bez priorit.

## Slepá místa, která council odhalil
- **Chybí kritérium pro zařazení položky do katalogu.** Bez mapy slib/krok/obava → položka nejde úplnost ani změřit.
- **Ve stejném seznamu se míchá klientský katalog s interním provozním backlogem** (runbook, DPA, podpora, #82, #83).
- **Obavy 5 (Sreality) a 2 (čtete mi e-maily) jsou právní a obchodní otázka, ne funkce.** Žádná položka je nevyřeší, potřebují právní stanovisko. #14 a #41 dokonce jdou proti obavě 2.
- **Kapacita dvou lidí a pořadí:** každá doplněná díra je další práce. Napřed je třeba škrtat a slučovat, pak doplňovat.
- **Ekonomika provozu na klienta** (LLM, SMS, scraper, čas na ladění) spočítaná není. To přímo ohrožuje odpověď na obavu 10.
- **Nástroj pro provozovatele** (přehled všech klientů, šablona nasazení) chybí. Done-for-you se bez něj neškáluje.
- **Závislost na třetích stranách** (SMS brána, LLM, portály) nemá plán B.

## Doporučení
1. Hned přeřadit sliby, které dáváme, ze ŽLUTÉ na „chceme": #29, #11, #12, #89, #76, a kroky cesty #74, #75, #77, #80.
2. Provést sloučení a vyřazení níže. Pak katalog rozdělit na **klientský katalog** (co makléř dostane) a **provozní backlog** (runbook, DPA, podpora, marketing Brokerly).
3. Sestavit mapu 4 sliby × 10 kroků × 10 obav → položka a ponechat jen položky, které na mapě mají řádek.
4. Kritická cesta pro pilot s Dorinou: přeposílací schránka → #20–#25 → pojistka AI (#29) → auditní log → hlídač provozu → měření od dne 1 → souhlasy a STOP. Všechno ostatní počká.
5. Rozšířit stávající položky místo zakládání nových:
   - #7 o průběžnou synchronizaci aktivních inzerátů (párování leadu na tom stojí),
   - #20 o ruční nebo telefonní zadání poptávky jako zálohu,
   - #77 o upomínky a pozastavení služby při neplacení,
   - #26 o SMS bránu.
6. AI Studio (#60–#65) a Kancelář (#67–#70) nechat jako oddělené linie mimo hodnocení úplnosti.
7. Zadat právní stanovisko ke scrapingu (obava 5) a ke čtení schránky (obava 2) a spočítat náklady na jednoho klienta měsíčně.

## NOVÉ položky
| Blok | Název | Popis (jedna věta) | Proč (jedna věta: slib/krok/obava) |
|---|---|---|---|
| 2 | Hlídač provozu a záložní režim | Hlídá, že poptávka přišla a do několika minut na ni odešla odpověď, upozorní na den bez poptávek a při výpadku pošle záložní upozornění makléři podle runbooku. | Obava 6 („vypadne to a lead propadne"). #88 zapisuje jen to, co proběhlo. |
| 2 | Přeposílací schránka a portály | Vyhrazená schránka pro každého klienta, parsery formátů Sreality/iDNES/Bezrealitky a návod na přeposílání. | Krok 7 (setup za 20 minut). #20 na tom celý stojí a je to největší technické riziko. |
| 2 | Napojení kalendáře | Obousměrná synchronizace kalendáře makléře, aby AI nabízela jen volné termíny. | #24 ji předpokládá. Bez ní hrozí dvojí rezervace (obavy 6 a 8). |
| 10 | Auditní log AI | Pro makléře čitelný záznam, co AI komu poslala, z jakého pole karty a kdo to schválil. | Obava 9 (kdo odpovídá za slib AI) a obava 1. |
| 10 | Souhlasy, STOP a výmaz | Evidence souhlasů a odhlášení napříč SMS, follow-upy a péčí, právo na výmaz a doba uchování dat. | Obavy 2, 4 a 9. Pro #26 a #27 jde o povinnost podle ePrivacy. |
| 9 | Měření hodnoty od dne 1 | Výchozí stav před nasazením a průběžný sběr reakčního času, propadlých leadů a ušetřených hodin, z čehož čerpá #80. | Obava 10 (vyplatí se 3,5K/měs.) a krok 8 („měřit od dne 1"). |
| 9 | Ladění hlasu a testy AI | Ze tří e-mailů vznikne profil hlasu, opravy makléře se do něj propisují a regresní sada otázek a zakázaných odpovědí se spouští před každou změnou. | Obavy 1 a 3, kroky 7–8 (tón a ladění). |
| 9 | Subdodavatelé a DPA | Seznam subdodavatelů (SMS brána, LLM, hosting) a zpracovatelské smlouvy s nimi. | Bez nich nejde podepsat #76 (jeden ze čtyř nedržených slibů, obava 9). |
| 9 | Podpora klienta | Kanál podpory, garantovaná doba reakce a zástup, když Ondřej ani Filip nejsou k dispozici. | Obavy 7 a 6. #79 pokrývá jen plánované schůzky, ne incidenty. |
| 9 | Odchod klienta | Vypnutí přeposílání, předání exportu, smazání dat, ukončení SMS a výpovědní podmínky. | Obavy 7 a 4, „v každém kroku může odejít". |
| 9 | Kvalifikace vlastních leadů | Skript pro první hovor s makléřem a evidence vlastních zájemců přímo v Brokerly CRM (dogfooding). | Kroky 1–2 cesty klienta nemají v katalogu žádnou položku. |
| Odloženo | Napojení na cizí CRM | Vrstva Brokerly nad CRM, které makléř už používá. | Původní slib a lék na obavu 7. Council se na něm neshodl, rozhodnout po pilotu. |
| Odloženo | Konzole provozovatele | Přehled všech klientů, jejich stavu a výpadků plus šablona nasazení. | Bez ní se done-for-you neškáluje. Potřeba od 3.–5. klienta. |

## SLOUČIT
| Čísla | Do čeho | Důvod (jedna věta) |
|---|---|---|
| 11, 12, 89 | #89 Data jsou makléřova (oddělení + export) | Jeden slib, pravidlo i dvě funkce ho realizují (5/5). |
| 29, 85, 87, 90 | #29 Pojistka AI (smí jen z karty → kontrola → schválení → při nejistotě notifikace) | Vrstvy jedné pojistky, jinak se postaví čtyřikrát. #28 Eskalace ji pak jen používá. |
| 24, 49 | #24 Rezervace prohlídky | Prohlídkový den je jen režim rezervace. |
| 47, 50 | #50 Chci prodat s odhadem ceny | Odhad ceny je lead magnet stránky „Chci prodat". |
| 35, 36 | #35 Matching | Dvoustranné párování je jen druhý směr téhož matchingu. |
| 33, 34, 38 | #33 Ranní digest | „Komu zavolat" a signály jsou obsah digestu. |
| 55, 56, 58 | #56 Péče po obchodu (šablony: recenze, výroční zpráva, hodnota bytu) | Jeden plánovač zpráv, tři šablony. |
| 52, 59 | #59 Program doporučení (s atribucí) | Atribuce je součást programu doporučení. |
| 39, 80 | #80 Report hodnoty | Jeden generátor reportů, jen různí příjemci. |
| 72, 73, 74, 75 | #72 Prodejní schůzka (ukázka, demo, dotazník, plán) | Kroky 3–5 jsou jeden prodejní proces. |
| 43, 44, 45, 46 | #43 Akviziční pipeline | Zdroj → skóre → oslovení je jeden tok. |

## NAVÍC (vyřadit z katalogu)
| # | Název | Důvod (jedna věta) |
|---|---|---|
| 14 | Nemovitost z e-mailů a příloh | Jde proti obavě 2 („čtete mi e-maily") a nenaplňuje žádný slib. |
| 15 | Skóre zájemce podle chování | Potřebuje data, která v pilotu nebudou. Kvalifikaci řeší #23. |
| 16 | Hlídání obchodu po rezervaci | Nenaplňuje žádný slib ani obavu, kanban to pokrývá ručně. |
| 17 | Archivace | Žádná vazba na slib. Výmaz a uchování dat řeší nová položka Souhlasy, STOP a výmaz. |
| 53 | Klientský portál se stavem obchodu | Mimo sliby a mimo kapacitu dvou lidí. |
| 57 | Narozeniny a svátky | Kosmetika bez vazby na slib, většina ji škrtá. |
| 66 | Úprava fotek | Komodita i uvnitř AI Studia, nepatří k žádnému slibu. |
| 71 | Nábor makléřů | Jiný zákazník a jiný problém, shoda 5/5. |
| 82 | Web brokerly.cz | Marketing Brokerly, ne služba makléři. Přesunout do interního backlogu. |
| 83 | Case study šablona | Marketing Brokerly, ne služba makléři. Přesunout do interního backlogu. |
| 94 | Smlouvy + e-podpis z dat obchodu | Je v rozporu s #92 „nedělat". |
| 95 | Predikce příjmu | Žádná vazba na slib, shoda 5/5. |

## Přeřadit
| # | Název | Změna | Důvod |
|---|---|---|---|
| 29 | Schvalovací režim | ŽLUTÁ → chceme | Slibujeme ho v kroku 8, nemůže zůstat nerozhodnutý. |
| 11 | Přihlášení a oddělení dat | ŽLUTÁ → chceme | Jeden ze čtyř slibů, které dnes nedržíme. |
| 12 | Export dat jedním tlačítkem | ŽLUTÁ → chceme | Slib a odpověď na obavy 4 a 7. |
| 89 | Data jsou makléřova | ŽLUTÁ → chceme | Slib a odpověď na obavu 4. |
| 31 | Kvalifikace proti turistům | později → chceme (jako součást #23) | Přímo odpovídá na obavu 8 (no-show a zvědavci). |
| 74 | Interaktivní dotazník | ŽLUTÁ → chceme | Krok 4 cesty klienta. |
| 75 | Plán na míru | ŽLUTÁ → chceme | Krok 5 cesty klienta. |
| 77 | Fakturace 50/50 + měsíčně | ŽLUTÁ → chceme (rozšířit o upomínky) | Krok 6 cesty klienta. |
| 80 | Report hodnoty | ŽLUTÁ → chceme | Krok 9 a obava 10. |

## Zamítnuto
- **Mezinárodní vrstva:** cíl růstu, ne díra vůči slibům pro české sólo makléře.
- **Hypoteční a právní partneři:** zdroj příjmu navíc, žádný slib ani obavu nenaplňuje.
- **Reaktivace studené databáze jako samostatná položka:** dá se použít jako „první výhra" v ladění (krok 8), nová služba to být nemusí.
- **Self-healing provozu:** přestřelené. Na obavu 6 stačí hlídač, záložní režim a runbook.
- **Pojištění odpovědnosti:** obchodní rozhodnutí do smlouvy #76, ne položka katalogu.
- **Právní ošetření scraperu jako položka:** obava 5 je úkol pro právní stanovisko, ne funkce.
- **Pilotní smlouva se zárukou jako samostatná položka:** patří do #75 a #76.
- **Příjem z dalších kanálů (telefon, web, WhatsApp) jako nová položka:** ruční zadání patří jako záloha do #20, WhatsApp zůstává jako #96 „později".
- **Zaškolení a nápověda:** pokryto #78 a novou položkou Podpora klienta.
- **Infrastruktura SMS brány jako samostatná položka:** patří do #26.
- **Průběžná synchronizace inzerátů jako nová položka:** doplnit jako rozšíření #7, ne jako novou službu.

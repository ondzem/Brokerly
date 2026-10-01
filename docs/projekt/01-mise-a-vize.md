# 01 — Mise a vize

Zdroj: `Brokerly_master_dokument.docx`, část A (kap. 1–13), červenec 2026.
Doplněno o posuny k 1. 10. 2026 (`► Stav 10/2026`).

---

## 1. Co Brokerly je — jednou větou a jedním odstavcem

**Jednou větou:** CRM je sklad dat o klientech a nemovitostech a naše
automatizační vrstva je asistent, který nad těmi daty sám jedná — odpovídá,
zapisuje, připomíná a plánuje za makléře.

**Odstavcem:** Brokerly je *done-for-you AI back office* pro české realitní
makléře a kanceláře. Není to jen software ani kurz — je to **služba**: vybereme
systém, nastavíme ho, napojíme automatizace a staráme se o jejich provoz. Běží
jako produktová řada vedle agentury (ozeman.cz), ne jako nová firma. Cíl: ušetřit
makléři čas napříč celým pracovním procesem a zajistit, aby mu **žádný lead
nepropadl**.

Vedle automatizační služby staví produkt i **vlastní jádro CRM** přizpůsobené
realitám — nejdřív pro sólo makléře, kancelářský segment ve druhé fázi. Tohle
jádro je to, co se právě staví (viz [03](03-stav-aplikace.md)).

### Hub-and-spoke — princip, na kterém všechno stojí

| Vrstva | Role | Přirovnání |
|---|---|---|
| **CRM = sklad dat** | Drží všechno o leadech, nemovitostech, klientech. Uchovává a zobrazuje, **sama nic nedělá**. | Kartotéka |
| **Automatizační vrstva = ruce** | Reaguje na data a koná: přijme poptávku, odpoví, zapíše lead, pošle připomínku, den po prohlídce se zeptá na dojem. | Asistent, který kartotéku obsluhuje |

Kartotéka bez asistenta je složka papírů; asistent bez kartotéky neví, s kým
mluví. **Hodnota je v propojení.** Protože každá automatizace jen čte a zapisuje
do tabulek, **tabulky se staví první** — to je celá etapa 1.

Původní záměr byl ještě širší: makléř už nějaké CRM má (stret.ai, Raynet,
Tabidoo) a my ho **nenutíme ho vyhazovat** — necháme jeho CRM jako sklad a
nasadíme na něj naši vrstvu. Vlastní CRM bylo myšleno jako jedna z možností
„hubu", ne jediná.

Notion (procesy 1.4) to upřesňuje: **hub je vždy náš** (dnešní aplikace);
když makléř má vlastní CRM (Raynet, CRM kanceláře), přidá se volitelně druhý
krok — po zápisu k nám se pošle API volání do jeho CRM (mapování polí).

> ► **Stav 10/2026:** stavíme výhradně vlastní CRM. Napojení na cizí CRM se
> nikde neřeší a nikdo o něm od července nemluvil. Je to jedna z klíčových
> otevřených otázek — viz [07 §1](07-otevrene-otazky.md).

---

## 2. Problém, který řešíme

Makléř tráví velkou část dne rutinou a přesto ztrácí obchody kvůli mezerám
v procesu:

1. **Ztrácí 20–30 % leadů pomalou reakcí** na poptávky z portálů.
2. **Zapomíná na majitele, kteří chtějí prodat později**, a na vlažné kontakty
   v CRM, které nikdo neobsluhuje.
3. **No-show na prohlídkách** — jezdí na schůzky, které se nekonají, nebo na
   zájemce bez možnosti koupit („realitní turisté").
4. **1,5–2 hodiny denně administrativy** — třídění pošty, zápisy, follow-upy.
   Denně desítky až stovky e-mailů, které nestíhá projít.

Řešení = **automatizovaný tok leadu** (okamžitá odpověď → rezervace → připomínky
→ follow-up → dlouhodobá péče) + **servisní vrstva**, která to nastaví a provozuje.

---

## 3. Pro koho to je

### Primární: zkušený sólo makléř

Nerozhoduje délka praxe, ale **vytíženost**:

- v oboru cca 5+ let, věk 25–50
- **3 a více současně inzerovaných nemovitostí** (vysoký objem práce)
- přichází o kontakty kupujících — lidé, kteří nemohli koupit *tuhle*
  nemovitost, ale dál hledají v lokalitě, mu vypadávají z evidence
- přichází o potenciální prodávající — majitele, kteří chtěli prodat
  „třeba za půl roku", a nikdo jim to nepřipomněl
- nemá ucelený systém: informace roztroušené, chybí přehled, co se na které
  nemovitosti právě děje
- denně desítky až stovky e-mailů

**Co mu prodáváme:** úsporu desítek hodin měsíčně, všechno na jednom místě od
A do Z — a hlavně to, aby **nepřicházel o statisíce korun** ušlého zisku z věcí,
na které zapomněl nebo je nesjednal.

### Sekundární (druhá fáze): realitní kanceláře s 5+ makléři

Prodává se vedení. Argument: **kontrola nad leady a výkonem** (balík KANCELÁŘ —
distribuce leadů s eskalací, týdenní PDF report řediteli).

### Ondřejova obecná cílová skupina (z `o-me-a-me-sluzbe.md`)

Tahle definice platí pro weby a Brokerly do ní zapadá: finanční poradci
a realitní makléři, 5+ let, aktivní inzeráty, finančně stabilní, jasná představa
o svém zákazníkovi. Brokerly je pro tu samou skupinu lidí jiný produkt než web —
proto dává smysl **cross-sell existujícím klientům**.

---

## 4. Čím vyhráváme — konkurence a odlišení

### Tři patra (Notion „CRM Systém struktura")

| Patro | Co | Kdo to má |
|---|---|---|
| **Jádro CRM** | kontakty s úplnou historií, nemovitosti, pipeline dealů, úkoly a připomínky, propojení všeho se vším | každé CRM; **to je naše etapa 1** |
| **Laťka dnešní špičky** (stret.ai) | AI asistent s kontextem CRM („Volal Petr Černý, hledá 2+kk v Karlíně do 6M" → kontakt + deal + doporučení), hlasové diktování, e-mailová integrace, publikace na portály jedním klikem, stahování poptávek, briefing a reporting | stret.ai; „pokud postavíte jen tohle, jste další stret.ai" |
| **Kde předběhnout** | speed-to-lead s odpovědí *za* makléře, rezervace + SMS, follow-up po prohlídce, dlouhodobý follow-up majitelů (**největší moat**), akviziční monitoring, kvalifikace proti turistům, AI Studio, recenze a výročí | nikdo |

**Důsledek:** etapa 1 je nutná, ale sama o sobě není důvod ke koupi. Důvod je
třetí patro.

**Trh:** vzdělaný (existují AI kurzy pro makléře = poptávka je), ale
**done-for-you segment je prázdný**. Konkurence je bodová:

| Konkurent | Co dělá | Cena |
|---|---|---|
| **stret.ai** (hlavní referenční) | AI-first CRM SaaS: AI asistent s kontextem CRM, hlasové diktování, e-mailová integrace, publikace na portály, stahování poptávek. Příběh „nemusíš ručně vyplňovat". | 1,2–2K/měs |
| MyLeady | samoprodejci | |
| Bezvabot | weboví chatboti | |
| FluentCall | voice | |

Nikdo nedělá **kompletní tok + servis**. Okno příležitosti: **12–24 měsíců**,
pak komoditizace.

### V čem se lišíme (6 bodů)

1. **Od „evidovat" k „jednat za makléře".** Konkurence lead zapíše, zpracovat ho
   musí makléř. My ho rovnou odbavíme.
2. **Dlouhodobý follow-up majitelů jako stroj.** Vlažné a minulé kontakty jsou
   největší nevyužitý poklad; automatizovat to skoro nikdo neumí. **To je náš
   moat.**
3. **Akvizice, ne jen příchozí leady.** Monitoring samoprodejců + alert na
   expirované inzeráty = aktivní hledání zakázek.
4. **Kvalifikace proti realitním turistům.** Prověření zájemce před prohlídkou.
5. **AI Studio.** Staging, půdorysy, vizualizace, popisky — kreativní výstupy,
   které konkurence nemá.
6. **Distribuce a servisní vztah.** Denní call-centrum, ~10 realitních klientů,
   brand v nice, bundle s contentem a Studiem. **Moat = vztah a hloubka niky,
   ne technologie.**

---

## 5. Obchodní model a ceny

Služba s jednorázovým **setupem** a měsíčním **provozem (maintenance)**.

| Produkt | Co obsahuje | Cena |
|---|---|---|
| **MAKLÉŘ** | Poptávky + prohlídky + follow-up majitelů + digest + bonusy (recenze, výročí) | 40K setup + 3,5K/měs |
| **MAKLÉŘ+** | Navíc matching databáze + monitoring soukromé inzerce + alert na expirace | 55K setup + 4,5K/měs |
| **KANCELÁŘ** | Vše + distribuce leadů s eskalací + reporting vedení | 90K setup + 9K/měs |
| **Studio** (za kus) | Virtual staging 400/foto · půdorys 1 200 · vizualizace 600 · popisky 300 · balíček inzerát 3 500 | dle kusu |
| **Asistentka** (později) | Chat/voice asistentka | 4–7K/měs |

**Ekonomika:** náklad na klienta ~2K setup a ~1K/měs (nástroje, API, SMS).
Marže ~95 % na setupu, ~75 % na provozu. Nasazení po šablonizaci ~4 h/klient.

**Prodejní argument:** jeden zachráněný obchod za půl roku (provize ~135K)
zaplatí službu trojnásobně. Jeden vrácený majitel = 100K+ provize.

> ► **Stav 10/2026:** ceník nebyl od července revidován a nebyl ověřen na
> žádném klientovi. Zda proběhly piloty (červen „NEMO + 1 sólo makléř",
> červenec „pilot č. 2 za plnou cenu"), z repa ani z pamětí nejde zjistit.
> Viz [07 §4](07-otevrene-otazky.md).

---

## 6. Go-to-market

### Prodejní a servisní trychtýř (Notion „Proces fungování")

1. Cold call / reklama → 2. web — zjistí o produktu → 3. prodejní prezentace →
4. **uzavření = peníze (setup)** → 5. onboarding = dotazník, informace
o klientovi → 6. personalizované nastavení, zaškolení → 7. převedení do praxe →
8. **3 měsíce revizní cally** na zlepšení jeho zkušenosti → 9. **předplatné =
peníze (maintenance)**.

Stejný rytmus jako u Ondřejových webů: dotazník na vstupu, 3 měsíce péče po
spuštění (viz `o-me-a-me-sluzbe.md` §6).

1. **Cross-sell existujícím realitním klientům** (nejteplejší leady).
2. **Denní call-centrum** — Brokerly jako druhý opener vedle contentu,
   s diagnostickými otázkami: reakční čas, no-show, ztracení majitelé.
3. **Case study content** na vlastní profil (čísla v hooku) → inbound.
4. **Q4: outbound na kanceláře 5+ makléřů**, prodej šéfovi.

**Hero funkce, se kterou se jde na trh: speed-to-lead tok** (poptávka →
rezervovaná prohlídka). Follow-up majitelů a Studio jsou „přidáme příště".

---

## 7. Roadmapa a cíle 2026 (z července)

| Období | Plán |
|---|---|
| Červen | Validace na existujících callech (NEMO + 1 sólo makléř), build MVP o víkendech, pilot č. 1 za 20K + case study |
| Červenec | Pilot č. 2 za plnou cenu, produktizace (ceník, PDF, SOP, smlouva s vymezením maintenance), Studio spuštěno okamžitě |
| Srpen | Prodej — cross-sell + call-centrum, cíl 3–4 klienti |
| Září–říjen | Šablonizace, monitoring chyb, delegace (Adéla admin, externí builder od 8 klientů) |
| Listopad–prosinec | Kancelářský segment (NEMO reference), voice pilot |
| **Cíl 31. 12. 2026** | **8–10 klientů ≈ 350–450K setup + 40–70K/měs MRR** |

> ► **Stav 10/2026:** roadmapa je o 3+ měsíce pozadu. Stavba běží od 5. 7.
> a je stále v **etapě 1 (ruční CRM jádro bez automatizací)**. Hero tok
> (speed-to-lead) neexistuje. Práce měla velké pauzy (14. 7. → 17. 8.,
> 28. 8. → 21. 9.). Cíl 8–10 klientů do konce roku je při současném tempu
> nereálný — roadmapu je třeba přepsat, ne jen posunout.

---

## 8. Tým, role, pravidla provozu

Z master dokumentu (červenec):

- **Filip — technika.** Automatizace, AI prompty a logika kvalifikace, API
  napojení (CRM, Google Drive, kalendář, SMS), scraping, logika digestu.
- **Ondřej — data, design a Studio.** Datová struktura, šablony textů,
  vizuální podoba (digest, PDF reporty pro vedení, rezervační stránka pod
  brandem klienta), kompletní provoz AI Studia (objednávky, zpracování, dodání
  do 24 h).
- Později: Adéla na admin (září–říjen), externí builder od 8 klientů.

**Pravidla provozu:**
- Call-centrum blok **8:45–11:00 je nedotknutelný**; build probíhá večery a víkendy.
- Závazné kapacitní pořadí: **Studio → automatizace → asistentka.** Nikdy vše naráz.

> ► **Stav 10/2026:** celou aplikaci staví Ondřej s Claude Code — 151 commitů,
> všechny od `ondzem`. Filipův podíl na kódu není v repu vidět (druhý vývojář je
> od 20. 8. nastavený, ale commity nejsou). Staví se **v kódu nad Supabase**,
> ne v no-code nástrojích, se kterými červenec počítal. Viz
> [07 §2](07-otevrene-otazky.md).

---

## 9. Rizika a jak na ně

| Riziko | Odpověď |
|---|---|
| **Komoditizace** — portály/CRM si přidají auto-odpovědi | Prodávat servis a výsledek, ne scénář. Jádro hodnoty ve follow-upu majitelů a kancelářské vrstvě. Zvážit partnerství se stret.ai jako implementátor. |
| **Platformové riziko** | Nestavět na jedné automatizaci; vstup přes e-mail, ne scrapování portálových poptávek. |
| **Kvalita AI a důvěra** | Eskalace na člověka od první verze; AI odpovídá **jen z karty nemovitosti**; konzervativní triáž (nejistota = notifikace, nikdy spam). |
| **Právní šedá zóna akvizice** | Systém **nikdy sám neoslovuje** soukromé inzerenty — jen ukazuje seznam, volá makléř. Smluvně: kontaktování je odpovědnost klienta. Interně „data servis", ne outreach. |
| **Kapacita** | Studio → automatizace → asistentka. Nikdy vše naráz. |

---

## 10. Co z toho plyne pro strategii (poznámka autora inventury)

Tři věci, které v červencovém dokumentu drží pohromadě a dnes drží míň:

1. **Produkt byl definován jako služba (done-for-you) nad cizím CRM; staví se
   jako vlastní SaaS CRM.** Obojí může být správně, ale je to jiný byznys, jiná
   cena, jiný go-to-market a jiný tým.
2. **Hero funkce (speed-to-lead) je důvod, proč to někdo koupí** — a je to
   jediná věc, která se zatím vůbec nestavěla. Etapa 1 je nutný základ, ale sama
   o sobě neprodává.
3. **Roadmapa počítala s no-code automatizacemi; stavíme v kódu nad Supabase.**
   Je to jiná práce a jiné dovednosti — a rozdělení rolí z července tomu
   neodpovídá.

Tohle nejsou závěry — jsou to místa, kde dotazník a strategie musí začít.

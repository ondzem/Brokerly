# procesy

### 1. PRÁCE S POPTÁVKAMI

### 1.1 Okamžitá odpověď a kvalifikace poptávek z portálů

**Jak to funguje:** Sreality/iDNES posílají poptávky e-mailem na adresu makléře. My tu adresu nechytíme přímo — místo toho mu uděláme **aliasový e-mail** (např. [*makler@brokerly.cz*](mailto:makler@brokerly.cz)) a požádáme ho, aby si v Sreality/iDNES nastavil přeposílání všech poptávek na tento alias. Druhá varianta: makléř nastaví automatické přeposílání ze své Gmail/Seznam schránky (filtr na "od [noreply@sreality.cz](mailto:noreply@sreality.cz)" → forward). Většina makléřů to umí, jinak mu to při onboardingu nastavíme po vzdálené ploše za 20 minut.

**Tok:** Sreality e-mail → Mailparser.io (vytáhne odesílatele, telefon, ID inzerátu, text) → webhook do Make → Claude API napíše personalizovanou odpověď v jeho tónu + 3 kvalifikační otázky (financování, termín, účel) → Resend pošle z jeho jména → Airtable zápis → SMS makléři přes smsbranu, pokud lead vypadá kvalitně.

**Co potřebujeme od makléře:** přeposílání nastavené, 5 minut na "tón" (ukázka 3 jeho předchozích odpovědí — AI z toho odvodí styl), jeho e-mailový podpis, telefon na SMS notifikace.

**Kvalifikační logika:** Claude odpovídá podle scénáře. Když člověk neodepíše do 24 h → automatický druhý dotaz. Když odepíše s konkrétní odpovědí na financování + termín → stav "A" + SMS makléři. Když odpoví vyhýbavě → stav "B", do digestu. Když nereaguje vůbec → "C", do databáze pro pozdější matching.

**Staví:** Filip (Make + AI prompty). Kolega připravuje šablony textů a Airtable strukturu.

### 1.2 AI chatbot pro makléře v aplikaci

**Pozor — tohle bych v 90 dnech nestavěl.** Je to interní asistent ("napiš za mě e-mail majiteli", "shrň komunikaci s klientem Novák"), ne klientský produkt. Hodnota je nízká vzhledem k buildu — makléř si stejné věci řekne ChatGPT za 200 Kč/měs sám. Posuneme na fázi po launchi jako součást MAKLÉŘ+ nebo později. **Označit v Notionu jako "po dni 90".**

### 1.3 Párování poptávek s novými inzeráty (matching)

**Jak to funguje:** Když přijde nový inzerát makléře (z jeho CRM nebo ručně přidaný do portálu), systém projede databázi všech předchozích poptávajících (z bodu 1.1) a vybere ty, jejichž požadavky odpovídají (lokalita, dispozice, rozpočet ±10 %). Pošle jim e-mail typu "Vzpomněli jsme si na vás, mám pro vás vhodný byt: [link]".

**Tok:** Nový inzerát v Airtable → Make filtr přes Leads → match podle pravidel → batch e-mail přes Resend → log do Activities.

**Co potřebujeme:** strukturovaná data o poptávkách (zaznamenává bod 1.1 automaticky) + makléř zadává nový inzerát do portálu nebo nám pošle URL z portálu (parsuje se).

**Hodnota:** mrtvá databáze začne vydělávat. Reálný argument na schůzce: "máte v telefonu 200 lidí, kteří kdysi hledali — kdy jste jim naposled poslal něco nového?"

**Staví:** Filip. Modul **MAKLÉŘ+**, ne základní balík — vyžaduje, aby měl klient v databázi alespoň 50 leadů, což je 1–2 měsíce běhu.

### 1.4 Automatický zápis leadů do CRM nebo tabulek

**Toto vlastně dělá bod 1.1** — každá poptávka se zapisuje do Airtable. Pokud makléř používá vlastní CRM (Raynet, realitní CRM kanceláře), přidáme druhý krok v Make: po zápisu do Airtable se pošle API call do jeho CRM (Raynet API zdokumentované, většina kanceláří má). Pro makléře bez CRM je hub samotný Airtable + portál.

**Co potřebujeme:** přístup k API jeho CRM (token), případně mapování polí (jméno → name, telefon → phone…).

**Staví:** Kolega — Airtable struktura je jeho doména. Filip dělá API napojení na CRM, když je požadováno.

### 1.5 Triáž e-mailové schránky

**Jak to funguje:** Connect Gmail/Outlook přes OAuth (Make má hotové moduly). Každý nový e-mail → Claude API klasifikuje do kategorií: POPTÁVKA, AKTIVNÍ OBCHOD (klient/advokát/banka/katastr), ÚŘADY/FAKTURY, NEWSLETTER/SPAM. POPTÁVKA jede do flow 1.1. AKTIVNÍ OBCHOD → SMS notifikace se shrnutím v jedné větě. Ostatní jdou do ranního digestu (bod 7).

**Co potřebujeme:** OAuth přístup ke schránce. Velká důvěrnostní bariéra — řešíme zpracovatelskou smlouvou a větou na schůzce: *"Data zůstávají ve vaší schránce, AI je jen čte, neukládá."*

**Pozor:** klasifikace musí být konzervativní. Pravidlo: když si AI není jistá → kategorie AKTIVNÍ OBCHOD (notifikace), nikdy ne SPAM. Falešně označený klient = ztracená důvěra v celý systém.

**Staví:** Filip. Modul součást základního balíku MAKLÉŘ.

### 2. PROHLÍDKY A PROCES PRODEJE

### 2.1 Samoobslužná rezervace prohlídek

**Jak to funguje:** V odpovědi z bodu 1.1 dostane kvalifikovaný zájemce link na Cal.com makléře. Tam vidí volné sloty (Cal.com je napojený na Google/Outlook kalendář makléře), vybere si, dostane potvrzení, makléř dostane upozornění + zápis do Airtable Viewings.

**Co potřebujeme:** OAuth na jeho kalendář (Google/Outlook), nastavení pracovní doby a délky prohlídky (45 min default), adresa nemovitosti se taháme z poptávky.

**Důležité pravidlo:** rezervační link nedostane každý — jen lead označený A nebo B podle kvalifikace. Tím chráníme makléře před zvědavci v kalendáři. Lead C dostane jen "děkujeme, ozveme se".

**Staví:** Filip (logika v Make). Kolega řeší Cal.com vzhled pod brandem klienta.

### 2.2 SMS připomínky před prohlídkou

**Jak to funguje:** Po rezervaci v Cal.com → Make trigger → vypočítá -24 h a -2 h před prohlídkou → naplánuje 2 SMS přes smsbranu na zájemce. Text personalizovaný (jméno, adresa, čas, kontakt na makléře). Zájemce může odpovědět STOP → systém zruší rezervaci, makléř dostane notifikaci.

**Co potřebujeme:** API klíč smsbrana, telefon zájemce (z poptávky), schválené texty SMS (vy je dodáte v rámci onboardingu).

**Staví:** Filip. Bod 2.1 + 2.2 jde do produkce společně, fungují jen v páru.

### 2.3 Follow-up den po prohlídce

**Jak to funguje:** 24 h po skončené prohlídce (bude si moc nastavit custom čas) → e-mail zájemci: "Děkujeme, jaký máte dojem? 1) zajímá mě, 2) ještě zvažuju, 3) ne, díky." Reakce se zapíše do Airtable, makléř vidí v portálu a v digestu. Bez reakce do 48 h → další jemné připomenutí. Bez reakce do týdne → stav "vychladlý" + zařazení do matching pipeline (bod 1.3).

**Staví:** Filip. Součást MAKLÉŘ základu.

### 2.4 Urgence a sběr podkladů od majitelů (Google Drive)

**Jak to funguje:** Po podpisu zprostředkovatelské smlouvy makléř založí v portálu kartu "nemovitost X" a vybere ze seznamu, co potřebuje (LV, PENB, foto, půdorys, energetický štítek…). Systém pošle majiteli sekvenci: úvodní e-mail s checklistem a uploadovým linkem (Google Drive folder vytvořený přes API, sdílený s majitelem) → každé 3 dny urgence na to, co chybí → po nahrání souboru notifikace makléři + automatická kontrola, jestli dokument vypadá smysluplně (Claude vidí obrázek/PDF, ověří že to není prázdná stránka).

**Co potřebujeme:** Google Drive Workspace makléře nebo náš sdílený (komplikace s GDPR — vždy makléřův), šablony e-mailů, seznam dokumentů (standardní + lokální).

**Hodnota:** každý makléř to dělá ručně a ztrácí týdny. Reálně zkracuje obchod o 2–4 týdny. Tohle prodávej v demu — má wow efekt.

**Staví:** Filip (Google Drive API přes Make). Modul **MAKLÉŘ základ**.

### 3. AKVIZICE NEMOVITOSTÍ

### 3.1 Monitoring soukromé inzerce (Bazoš, Sreality samoprodejci)

**Jak to funguje:** Stávající infrastruktura, kterou už máš na Sreality scraping pro CC listy. Rozšíříme o Bazoš. Cron každý den ráno → projede inzeráty bez RK v regionu klienta → nové inzeráty zapíše do Airtable klienta s telefonem majitele a odkazem → ráno se objeví v digestu jako "noví majitelé v Plzni: 7 nových inzerátů".

**Právní pozor:** scraping a oslovování soukromých inzerentů je šedá zóna. **Nikdy to nepostavíme tak, že systém sám rozesílá zprávy.** Pouze ukáže makléři list, makléř volá sám. Tím se chráníme i klient. V smlouvě klauzule, že kontaktování je odpovědnost klienta. Označit v interní dokumentaci jako "data servis", ne "outreach".

**Co potřebujeme:** specifikaci regionu a typu nemovitostí (klient si zadá v portálu).

**Staví:** Filip — přenese stávající infrastrukturu. Modul **MAKLÉŘ+**.

### 3.2 Alert na expirované inzeráty

**Jak to funguje:** Stejný scraping rozšířený o sledování stáří inzerátu (dat. publikace, pokud Sreality vrací). Inzerát na 60+ dní bez prodeje + bez RK → alert do digestu. Důvod: po 60 dnech je majitel frustrovaný a otevřenější makléři.

**Drobný háček:** Sreality občas datum publikace mění při editaci ceny (tvůj NEMO_tracker poznatek). Řešíme tak, že si datum prvního výskytu zapisujeme my, ne věříme Sreality. Vyžaduje denní snapshot databáze.

**Staví:** Filip. Součást **MAKLÉŘ+** s bodem 3.1.

### 3.3 Dlouhodobý follow-up majitelů

**Jak to funguje:** Makléř má schůzku, majitel řekne "ozvěte se za 6 měsíců". Makléř v portálu (nebo přes WhatsApp větu botovi — pokročilejší fáze) zaznamená kontakt + datum návratu + důvod. Systém:

- **D + 0:** poděkování za schůzku
- **každý 1. v měsíci** do D-day: e-mail "vývoj cen ve vaší lokalitě" — automaticky generovaný z dat Sreality (průměrná cena za m² v ulici/čtvrti, počet prodaných v posledních 90 dnech)
- **D-day −7:** úkol makléři v digestu "tento týden volat Novákovi"
- **D-day:** SMS upomínka makléři + souhrn historie kontaktů

**Co potřebujeme:** makléř zadává kontakt do portálu (3 pole — jméno, telefon, datum, lokalita), zbytek běží sám.

**Hodnota:** jeden vrácený majitel = 100K+ provize. Toto je tvůj nejsilnější prodejní argument akviziční vrstvy.

**Staví:** Filip pro logiku, kolega pro UI v portálu. Modul **MAKLÉŘ základ**.

### 4. AI STUDIO (můžeme použít Higgsfield)

Tohle je kolegova doména od dne 1, protože je to čistě servisní produkt — žádný build automatizací, jen objednávkový tok.

### 4.1 2D a 3D půdorysy

**Nástroj: CubiCasa nebo Matterport.** Makléř scanuje místnost telefonem (instruktážní video pošleme), pošle nám .ccp soubor přes objednávkový formulář v portálu. Kolega ho zpracuje v CubiCasa Cloud (cca 15 min práce), vrátí PDF s 2D + 3D + výměrami do 24 h.

**Cena:** 1 200 Kč. Náklad: ~150 Kč (CubiCasa credity). Marže 87 %.

**Alternativa pro makléře, kteří se scanovat odmítají:** pošlou nám fotky půdorysu nebo náčrt → kreslíme ručně v Floorplanneru (free). Pomalejší (45 min), ale použitelné.

### 4.2 Virtual staging

**Nástroj: Virtual Staging AI** + záloha **Reimagine Home**. Makléř pošle fotky prázdných místností. Kolega vybere styl (skandinávský, moderní, mladý pár, rodina), vygeneruje 2–4 varianty, vybere nejlepší, retušuje drobné chyby v Photoshopu (10–15 min), vrátí JPG do 24 h.

**Cena:** 400 Kč/foto. Náklad: ~30 Kč. Marže 92 %.

**Pravidlo:** vždy přidat do popisku inzerátu disclaimer "virtuálně zařízeno pro ilustraci" — chrání makléře proti stížnostem.

### 4.3 Renovační vizualizace

**Nástroj: Reimagine Home.** Makléř pošle fotku starého bytu + popis ("rekonstrukce, světlé barvy, otevřená kuchyně"). Kolega vygeneruje "po rekonstrukci". Cena 600 Kč/foto, marže ~92 %.

### 4.4 Popisky inzerátů + překlady (Nutnost hlubokého copywritingu)

**Nástroj: Claude API.** Makléř pošle základní data (dispozice, výměra, lokalita, 3 charakteristiky). Claude vygeneruje popis, makléř si vybere ze 3 variant (krátká/emocionální/věcná). Překlad EN/DE/UA automaticky.

**Cena:** 300 Kč/inzerát. Náklad: <10 Kč. Marže 97 %.

**Balíček "inzerát komplet"** (5 fotek staging + půdorys + popis EN/CZ) = 3 500 Kč. Toto prodávej jako prioritu — nejvyšší ticket, nejlepší marže, jeden objednávkový tok.

**Tok objednávky:** klient v portálu zaškrtne typ a počet, nahraje podklady, dostane potvrzení s termínem. Notifikace kolegovi. Po dodání e-mail klientovi s linkem na Google Drive folder s výsledky.

### 5. PÉČE O KLIENTY A DOPORUČENÍ

### 5.1 Žádost o Google recenzi

**Jak to funguje:** Makléř v portálu označí obchod jako "uzavřený" (datum předání). 7 dní po předání → e-mail kupujícímu se třemi otázkami (jste spokojen / co mohlo být lepší / dáte recenzi?) → pokud "ano", druhý e-mail s přímým linkem na Google recenzi makléře.

**Co potřebujeme:** Google Place ID makléře (jednorázově při onboardingu — kolega zjistí).

**Hodnota:** makléři s 50+ recenzemi vyhrávají lokální vyhledávání. Nikdo to systematicky nedělá.

**Staví:** Filip. Bonus do balíku MAKLÉŘ.

### 5.2 Výroční zprávy + doporučení

**Jak to funguje:** Rok po předání → e-mail "rok ve vašem novém bytě" (osobní tón, foto domu, otázka na dojmy) + jemná žádost o doporučení s formulářem.

**Staví:** Filip. Bonus do balíku.

### 6. PRO VEDENÍ KANCELÁŘE

### 6.1 Reporting výkonu makléřů

**Jak to funguje:** Týdenní cron každé pondělí 6:00 → projede Airtable všech makléřů kanceláře → vygeneruje report v PDF a pošle e-mailem řediteli. Obsah: reakční časy per makléř, počet poptávek, počet rezervovaných prohlídek, účast na prohlídkách, počet uzavřených, červeně označení podvýkonní (reakce > 30 min) a top makléři.

**Co potřebujeme:** kancelář na balíku KANCELÁŘ má vše centralizované v jedné Airtable bázi s polem "broker" u každého záznamu. Distribuce leadů (níže) sem píše automaticky.

**Staví:** Filip pro logiku, kolega pro vizuální podobu PDF reportu (musí vypadat seriózně — to vedení kupuje).

**Doplnit k bodu 6:** **distribuce leadů s eskalací.** Lead přijde → systém rozhodne, kterému makléři poslat (round-robin nebo podle lokality) → makléř má 15 min na převzetí (kliknutím v notifikaci) → bez převzetí jde dalšímu makléři → po třetí eskalaci jde řediteli. Toto je hodnotová špička balíku KANCELÁŘ.

### 7. RANNÍ DIGEST

**Jak to funguje:** Cron 7:30 → Make projede Airtable klienta → Claude API dostane všechna data dne (nové leady, prohlídky, majitelé k oslovení, věci k řešení v inboxu) → vygeneruje strukturovaný shrnutí v tónu osobní asistentky → odešle e-mailem (Resend) + volitelně WhatsApp.

**Struktura digestu:** 1) 3 priority dne (top), 2) noví leady se skóre, 3) dnešní prohlídky, 4) majitelé k oslovení, 5) cokoli z inboxu, co vyžaduje pozornost.

**Důležité:** digest je tvář produktu. Investovat čas do designu e-mailu (kolega — HTML šablona v Resend), tónu textu (Filip — AI prompty), a osobní personalizace (oslovuje křestním jménem, zmiňuje včerejšek). Klient kvůli němu platí maintenance.

**Staví:** Filip + kolega společně (logika + design). Součást **MAKLÉŘ základu**
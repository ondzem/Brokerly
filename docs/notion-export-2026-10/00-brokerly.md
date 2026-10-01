# Brokerly

<aside>
💡

### Poznámky

- Přidat funkci někam, toho, že to prodá později. V podstatě tam potřeba udělat nějaká filtrace nebo něco podobného, pro to, aby věděl, že OK, tuhle tu nemluvitost se prodá později. Tak potřebuji někdy nějak označit.
- ID Inzerátu
- udělat umělou inteligenci - chatbot
- archivace kontaktů a nemovitostí
- 

</aside>

[Proces fungování](01-proces-fungovani.md)

<aside>
💡

# Co bude aplikace umět:

### 1. Práce s poptávkami (Kupující)

- **Okamžitá automatická odpověď a kvalifikace** poptávek z portálů (Sreality, iDNES atd.)
- **AI chatbot** pro makléře v té apce
- **Automatické párování poptávek** s novými inzeráty v nabídce (matching)
- **Automatický zápis leadů** do CRM nebo tabulek
- **Automatické třídění a triáž** e-mailové schránky makléře

### 2. Prohlídky a proces prodeje

- **Samoobslužná rezervace prohlídek** přes online kalendář
- **Automatické SMS připomínky** (remindery) před prohlídkou
- **Automatický follow-up** den po prohlídce (žádost o zpětnou vazbu)
- **Automatická urgence a sběr podkladů** (LV, PENB, fotky) od majitelů - Google disk propojení

### 3. Akvizice nemovitostí (Získávání zakázek)

- **Monitoring a scraping soukromé inzerce** (Bazoš, Sreality) pro vyhledání samoprodejců
- **Alert na expirované inzeráty** (inzeráty bez prodeje po 60+ dnech)
- **Dlouhodobý automatický follow-up** majitelů, kteří chtějí prodat až později

### 4. Kreativní výstupy (AI Studio)

- **Generování 2D a 3D půdorysů** z náčrtů nebo scanů
- **Virtual staging** (virtuální zařizování prázdných místností na fotkách)
- **Renovační vizualizace** (jak by mohl starý byt vypadat po rekonstrukci)
- **AI generování popisků** inzerátů a jejich překlady do cizích jazyků

### 5. Péče o klienty a doporučení

- **Automatická žádost o Google recenzi** po uzavření obchodu
- **Výroční zprávy** a automatické dotazy na doporučení rok po koupi

### 6. Pro vedení realitní kanceláře

- **Automatický reporting** a statistiky výkonu jednotlivých makléřů pro šéfa

### 7. Denní organizace makléře

- **Ranní e-mailový digest** (každé ráno stručný souhrn 3 nejdůležitějších věcí k vyřízení)
</aside>

<aside>
💡

# Business plán

### 1. Co to je

Done-for-you AI back office pro realitní makléře a kanceláře. Ne software, ne kurz — služba: vybereme systém, nastavíme, napojíme automatizace a staráme se o provoz. Běží jako produktová řada vedle agentury, žádná nová firma.

### 2. Problém a řešení

Makléř ztrácí 20–30 % leadů pomalou reakcí, zapomíná majitele, má no-show na prohlídkách a 1,5–2 h denně admin. Řešení: automatizovaný tok leadu — okamžitá odpověď na poptávky + kvalifikace, rezervace a remindery prohlídek, dlouhodobý follow-up majitelů, ranní email digest, recenze/výročí. Architektura hub-and-spoke: existující CRM (stret.ai/Raynet/Tabidoo) jako sklad dat, moje automatizace jako vrstva, která jedná.

### 3. Trh a konkurence

Trh vzdělaný (AI kurzy pro makléře = ověřená poptávka), ale done-for-you segment prázdný. Konkurence bodová: stret.ai (CRM SaaS, 1,2–2K/měs), MyLeady (samoprodejci), Bezvabot (web chatboti), FluentCall (voice). Nikdo nedělá kompletní tok + servis. Okno 12–24 měsíců, pak komoditizace.

### 4. Konkurenční výhoda

Distribuce (denní CC stroj, ~10 realitních klientů, brand v nice), bundle s contentem a Studiem, servisní vztah místo softwaru. Moat = vztah a hloubka niky, ne technologie.

### 5. Produkty a ceny

- **MAKLÉŘ:** poptávky + prohlídky + follow-up majitelů + digest + bonusy — **40K setup + 3,5K/měs**
- **MAKLÉŘ+:** navíc matching databáze + monitoring soukromé inzerce — **55K + 4,5K/měs**
- **KANCELÁŘ:** vše + distribuce leadů + reporting vedení — **90K + 9K/měs**
- **Studio (za kus):** virtual staging 400/foto, půdorys 1 200, vizualizace 600, balíček inzerát 3 500
- Později (od podzimu): chat/voice asistentka 4–7K/měs

### 6. Ekonomika

Náklad na klienta: ~2K setup + ~1K/měs (Make, API, SMS). Marže ~95 % setup / ~75 % maintenance. Nasazení po šablonizaci 4 h/klient. Prodejní argument klientovi: 1 zachráněný obchod za půl roku (provize ~135K) = 3× zaplaceno.

### 7. Go-to-market

1. Cross-sell existujícím realitním klientům (nejteplejší leady)
2. CC integrace — druhý opener vedle contentu, diagnostické otázky (reakční čas, no-show, ztracení majitelé)
3. Case study content na vlastní profil (čísla v hooku) → inbound
4. Q4: outbound na kanceláře 5+ makléřů, prodej šéfovi (kontrola nad leady)

### 8. Roadmapa

- **Červen:** validace na existujících callech (NEMO + 1 solo), build MVP o víkendech, pilot č. 1 za 20K + case study
- **Červenec:** pilot č. 2 za plnou cenu, produktizace (ceník, PDF, SOP, smlouva s vymezením maintenance), Studio spuštěno okamžitě
- **Srpen:** prodej — cross-sell + CC, cíl 3–4 klienti
- **Září–říjen:** šablonizace, monitoring chyb, delegace (Adéla admin, externí builder od 8 klientů)
- **Listopad–prosinec:** kancelářský segment (NEMO reference), voice pilot
- **Cíl 31.12.2026:** 8–10 klientů ≈ **350–450K setup + 40–70K/měs MRR**

### 9. Pravidla a rizika

- CC blok 8:45–11:00 nedotknutelný; build jen večery/víkendy
- Komoditizace (stret.ai a spol.) → prodávat servis a výsledek, ne scénář; zvážit partnerství se stret.ai jako implementátor
- Platformové riziko (portály/CRM přidají auto-odpovědi) → nestavět na jedné automatizaci, jádro hodnoty ve follow-upu majitelů a kancelářské vrstvě
- Kapacita → závazné pořadí: Studio → automatizace → asistentka; nikdy vše naráz
</aside>

[procesy ](02-procesy.md)

<aside>
💡

# První krok v Brokerly

### **Krok 1: Příchod poptávky (Sreality → Systém)**

- **Co se stane:** Zájemce (např. pan Jan Novák) vidí na Sreality inzerát na byt v Plzni, který prodává tvůj pilotní makléř (např. Petr Zach). Pan Novák klikne na „Napsat makléři“ a odešle zprávu: *„Dobrý den, mám zájem o prohlídku bytu. Je k dispozici sklep? Děkuji, Novák. Tel: 777 111 222.“*
- **Technické pozadí:** Sreality odešlou e-mail. Ten se automaticky přepošle na alias `petr.zach@brokerly.cz` (nebo přes filtr v makléřově Gmailu). Make.com zachytí e-mail a Mailparser z něj vytáhne:
    - **Jméno:** Jan Novák
    - **Telefon:** 777 111 222
    - **E-mail:**
        
        **jan.novak@email.cz**
        
    - **ID inzerátu / Nemovitost:** Byt 2+kk, Plzeň - Slovanská
    - **Dotaz:** Má zájem o prohlídku, ptá se na sklep.
    

---

### **Krok 2: AI Zpracování & Okamžitá odpověď (do 2 minut)**

- **Co se stane:** Systém zapíše pana Nováka do Airtable databáze jako nový lead. Claude API zanalyzuje dotaz a vygeneruje odpověď v tónu Petra Zacha (např. přátelský, ale profesionální tykání/vykání).
- **Příklad e-mailu, který panu Novákovi dorazí (odesílatel: Petr Zach):**
    
    > „Dobrý den, pane Nováku, děkuji za Váš zájem o byt 2+kk na Slovanské v Plzni. Ano, k bytu náleží zděný sklep o velikosti 3 m².
    > 
    > 
    > Abychom ušetřili Váš čas, můžete si termín prohlídky vybrat přímo v mém kalendáři zde: **[ODKAZ NA REZERVACI]**.
    > 
    > Předtím se Vás jen krátce zeptám:
    > 
    > 1. Jak plánujete koupi financovat? (Hypotéka / hotovost / prodej jiné nemovitosti?)
    > 2. Kdy byste se ideálně potřeboval stěhovat?
    > 
    > Těším se na setkání, Petr Zach“
    > 

---

### **Krok 3: Kvalifikace & Rezervace termínu**

- **Co se stane:** Pan Novák klikne na odkaz (Cal.com). Odkaz je unikátní a už ví, že jde o pana Nováka a byt na Slovanské.
- **Příklad chování zájemce:** Pan Novák si vybere úterý 16. 6. v 15:00. Do políčka financování napíše: *„Mám předschválenou hypotéku u KB.“*
- **Technické pozadí:** Cal.com zapíše termín přímo do reálného Google/Outlook kalendáře Petra Zacha (tím se tento čas zablokuje pro ostatní). Cal.com pošle webhook do Make.com, který:
    1. Aktualizuje stav leadu v Airtable na: **Stav A (Kvalifikovaný, rezervovaný)**.
    2. Odešle Petrovi Zachovi okamžitou SMS (nebo WhatsApp): *„Nová prohlídka! Jan Novák si rezervoval byt Slovanská na úterý 16. 6. v 15:00. Financování: Hypotéka KB.“*

---

### **Krok 4: SMS Remindery (Prevence no-show)**

- **Co se stane:** Systém hlídá čas prohlídky a automaticky posílá SMS zprávy panu Novákovi.
- **Příklad SMS 24 hodin předem:**
    
    > *„Dobrý den, pane Nováku, připomínám naši zítřejší prohlídku bytu Slovanská v 15:00 s makléřem Petrem Zachem. Pokud by se Vám termín nehodil, dejte nám prosím vědět odpovědí na tuto zprávu nebo kliknutím zde: [Link].“*
    > 
- **Příklad SMS 2 hodiny předem:**
    
    > *„Dobrý den, za dvě hodiny (v 15:00) se na Vás těším na adrese Slovanská 45, Plzeň. V případě potíží s parkováním volejte přímo mně na 777 222 333. Petr Zach.“*
    > 
- **Pokud zájemce neodpoví/potvrdí:** Prohlídka platí. Pokud klikne na zrušení, makléři okamžitě pípne SMS o zrušení a termín se v kalendáři uvolní.

---

### **Krok 5: Ranní Digest (7:30 ráno)**

- **Co se stane:** Každé ráno dostane Petr Zach přehledný e-mail, aby nemusel otevírat Airtable ani procházet staré e-maily.
- **Příklad ranního digestu:**
    
    > **Dobré ráno, Petře!** ☕ Tady je Tvůj přehled na dnešek (úterý 16. 6.):
    > 
    > 
    > **Dnešní prohlídky:**
    > 
    > - **15:00** – Jan Novák (Byt Slovanská). Stav: Potvrzeno SMSkou, hypotéka KB schválena.
    > 
    > **Nové poptávky ke zpracování (Čekají na odpověď):**
    > 
    > - **Marie Sýkorová** (Dům Doubravka) – Systém odeslal AI odpověď včera ve 20:15. Zatím neklikla na rezervační link.
    > 
    > **Majitelé k oslovení (Follow-up):**
    > 
    > - **Pan Král (Doubravka):** Před 6 měsíci řekl, že bude prodávat v červnu. Systém mu posílal měsíční cenové reporty. Dnes je čas mu zavolat na číslo 608 111 222.
    > 
    > Úspěšný den! Tvůj Brokerly asistent.
    > 

---

### **Krok 6: Zpětná vazba (24 hodin po prohlídce)**

- **Co se stane:** Systém ví, že prohlídka skončila v úterý v 15:45. Ve středu v 16:00 pošle panu Novákovi automatický e-mail.
- **Příklad e-mailu:**
    
    > *„Dobrý den, pane Nováku, děkuji za včerejší setkání na prohlídce bytu Slovanská. Rád bych se zeptal, jaký máte z nemovitosti dojem? Stačí kliknout na jednu z možností:*
    > 
    > - *[1] Mám vážný zájem o koupi.*
    > - *[2] Byt se mi líbí, ale ještě zvažuji jiné nabídky.*
    > - *[3] Byt mě nezaujal (nechci koupit).* *Petr Zach“*
- **Výsledek:** Pokud Novák klikne na [1], makléř okamžitě dostává upozornění „HORKÝ ZÁJEMCE“ a volá mu přednostně. Pokud [3], systém ho vyřadí z této nemovitosti a zařadí do databáze pro matching (až bude mít makléř jiný podobný byt, systém mu ho auto-odešle).
</aside>

[CRM Systém struktura](03-crm-system-struktura.md)

[Proces makléře](04-proces-maklere.md)

Naším ideálním klientem je zkušený realitní makléř, který je v oboru, řekněme, 5 a více let. Ta doba není až tak důležitá jako jeho vytíženost, kde cílíme na makléře, kteří mají vyšší objem práce a často přicházejí o kontakty. Ideálně mají inzerované tři a více nemovitostí. 25-50 věková kategorie.

O kontakty právě kupujících, kteří třeba nemohli koupit tu danou nemovitost, ale hledají dál nemovitost v dané lokalitě. Zároveň přicházejí o potenciální prodávající. Tři to chtěli prodat například za půl roku, nemají jasný ucelený systém informací, stránek a nemají v tom jasně daný přehled o tom, co se děje, jaký je proces na té nemovitosti.

Proto my jim nabízíme tento produkt, který jim ušetří desítky hodin měsíčně nějakým zapisováním, hledáním informací, a budou mít vše na jednom místě, jasný přehled, což vlastně je základ té služby jako samotné.

V návaznosti na to těm makléřům chodí desítky, stovky e-mailů denně, tudíž často nemají a nestíhají to procházet. My jsme schopni jim ty dané informace vyfiltrovat, abychom jim ušetřili ten čas, a v návaznosti na to navrhnout i případné odpovědi a celé tyto připomínky, co se týče kupujících a prodávajících, kdy se ozvat, jaký bude další postup, nějaké e-maily by měl odepsat atd.

Vše bude celé v tom rozhraní, tak aby bylo všechno na jednom místě, od bodu A do bodu Z. A ten zkušený makléř v tom objemu práce nepřicházel o statisíce korun ušlého zisku u věcí, na kterých zapomněl, anebo je nesjednal.
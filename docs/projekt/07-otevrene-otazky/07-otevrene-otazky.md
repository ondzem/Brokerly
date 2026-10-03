# 07 — Otevřené otázky a rozpory

Všechno, co z dokumentů **nejde** zjistit, nebo kde si dokumenty a realita
odporují. Tohle je surovina pro dotazník „na nás dva" a pro zakladatelskou
schůzku. Seřazeno podle toho, jak moc to mění, co se bude stavět dál.

Každá položka: **otázka** · kde rozpor vznikl · co by změnila odpověď.

---

## 1. Co vlastně stavíme — vrstva nad cizím CRM, nebo vlastní CRM?

**Rozpor:** Master dokument kap. 1 a 4: „makléř už nějaké CRM má, nenutíme ho
ho vyhazovat — necháme existující CRM jako sklad dat a nasadíme na něj
automatizační vrstvu" (stret.ai, Raynet, Tabidoo). Současně kap. 14–17
specifikuje vlastní jádro a od 5. 7. se **staví výhradně vlastní CRM**.
Napojení na cizí CRM se nikde neřeší.

Notion (procesy 1.4) ukazuje, že záměr byl **hybridní**: náš hub je vždy,
cizí CRM se k němu volitelně synchronizuje přes API. Současná aplikace je ten
hub — takže rozpor je menší, než vypadá; chybí jen rozhodnutí o synchronizaci
do cizích CRM.

**Otázky:**
- Je vlastní CRM *jedna z možností hubu*, nebo *ten produkt*?
- Zůstává v plánu synchronizace do Raynetu / CRM kanceláře (Notion 1.4)?
- Když makléř má Raynet, nabízíme mu migraci k nám, nebo vrstvu nad Raynetem?
- Konkurujeme stret.ai (CRM), nebo jsme „implementátor nad stret.ai" (kap. 13
  to zvažuje jako odpověď na komoditizaci)?

**Co to mění:** celý go-to-market (prodáváme software, nebo službu?), cenu
(SaaS 1–2K vs. setup 40K + 3,5K), architekturu vrstvy 2 (konektory na cizí
CRM vs. jen vlastní tabulky), konkurenční pozici.

---

## 2. Kdo co dělá — role vs. realita

**Rozpor:** Kap. 9: Filip = technika (AI, API, scraping, automatizace), Ondřej
= data, design, Studio. Realita: Ondřej s Claude Code postavil celé CRM (151
commitů), Filip v repu nemá commit.

Z Notionu: Filip má **existující scraping infrastrukturu Sreality pro
call-centrové listy** („NEMO_tracker") — jediná hotová technická věc vrstvy 2,
mimo repo. Notion u každé funkce píše „Staví: Filip".

**Otázky:**
- Co Filip reálně dělal od července? Kde je scraper, v čem běží, jde ho
  použít pro monitoring (3.5) rovnou?
- Vrstva 2 se staví v kódu nad Supabase — staví ji Filip, Ondřej s Claude
  Code, nebo oba? Co z toho Filip umí/chce?
- Kdo vlastní produkt (rozhoduje o rozsahu) a kdo vlastní techniku?
- Je Claude Code „třetí člen týmu" i pro Filipa, nebo jen pro Ondřeje?

**Co to mění:** kdo staví hero tok, v čem, a jak rychle.

---

## 3. Kde poběží automatizace (vrstva 2)

**Stav:** rozhodnuto, že v kódu nad Supabase. Vrstva 2 potřebuje: příjem
e-mailů, AI generování odpovědí, odesílání e-mailů jménem makléře, kalendář
s rezervací, SMS, plánované úlohy (remindery, digest 7:30, urgence každé
3 dny). Kandidáti služeb ze zadání: Claude API, Resend, smsbrana, Cal.com,
Google Drive API (viz [05 §5](../05-nastroje-a-technika/05-nastroje-a-technika.md)).

**Otázky:**
- Které z externích služeb vzít, a co postavit vlastní (rezervační stránka?
  SMS přes jiného poskytovatele?)?
- Náklad na poptávku (Claude API + SMS)?
- Odesílání e-mailů **jménem makléře** — z jeho schránky (OAuth Gmail/Outlook)
  nebo z našeho aliasu `makler@brokerly.cz` (kap. 19.1 zmiňuje obojí)?
- SMS brána a cena za SMS (plán ~1K/měs na klienta).

**Co to mění:** kompletně, co se bude dalších X měsíců stavět.

---

## 4. Piloti a klienti — co se stalo od července

**Chybí:** jakákoli stopa po pilotu č. 1 (červen, NEMO + 1 sólo makléř, 20K),
pilotu č. 2 (červenec, plná cena), Studiu („spuštěno okamžitě"), prodeji
(srpen, 3–4 klienti).

**Otázky:**
- Byl nějaký pilot? Platil někdo? Je NEMO reálný klient/reference?
- Běží AI Studio jako služba mimo repo? Jaké objednávky, jaké náklady?
- Co říkají makléři z call-centra na diagnostické otázky (reakční čas,
  no-show, ztracení majitelé)? Jsou záznamy?
- Máme jediného makléře, který by byl ochotný být pilotem pro hero tok?

**Co to mění:** zda stavíme pro konkrétního člověka (ideál), nebo do prázdna.

---

## 5. Roadmapa a cíle

**Rozpor:** cíl 31. 12. 2026: 8–10 klientů, 40–70K MRR. K 1. 10. je etapa 1
bez automatizací, bez nasazení, bez klienta.

**Otázky:**
- Jaký je realistický cíl do konce roku? (Např.: hero tok end-to-end
  u jednoho pilotního makléře.)
- Kolik hodin týdně má každý z nás? (Kap. 9.1: večery a víkendy.)
- Je Brokerly priorita vedle agentury, nebo vedlejší projekt?

---

## 6. Rozsah etapy 1 — co s odchylkami

**Rozpor:** AGENTS.md §7 „nepřidávat pole ani funkce", a přitom se přidaly
provize/náklady, dokumenty, historie ceny, import z inzerátu, matching,
vyplnitelné bloky pozemek/komerční/pronájem; naopak **teplota zmizela** z UI.

**Otázky:**
- Potvrdit, co zůstává (pravděpodobně všechno) a **přepsat AGENTS.md §4 a §7**.
- Teplota: spec ji potřebuje pro kvalifikaci A/B/C a „komu volat první". Má se
  vrátit (třeba jen jako výsledek automatické kvalifikace, ne ruční pole)?
- Pozemek/komerční/pronájem: nechat v UI (už je), nebo skrýt podle spec?
- Etapa 1 je hotová? Kdo to řekne a podle čeho (testovací průchod)?

---

## 7. Technické blokátory před prvním klientem

Nejsou otázky, jsou to fakta k rozhodnutí *kdy*:

- **Přihlášení a oddělení dat** — dnes jedna DB, RLS `true`, anon klíč
  veřejný. První klient = nutnost auth + tenant.
- **Nasazení** — doména, hosting, oddělené prostředí od vývoje.
- **`PropertiesView.tsx` 6 216 řádků** — rozdělit před vrstvou 2.
- **Kontakty** — dotáhnout na úroveň nemovitostí.
- **GDPR** — zpracovatelská smlouva (kap. 19.2 ji slibuje), hlídání souhlasu.
- **Zálohy** — Supabase free tier: jaké zálohy máme?

---

## 8. Drobnější nejasnosti

| Otázka | Kde vzniklo |
|---|---|
| Doména `brokerly.cz` — **máme** (Forpsi, Ondřejův účet). Web na ní není. | kap. 19.1 alias `makler@brokerly.cz` |
| Logo — kdo ho dělal, jsou zdroje, barvy značky mimo aplikaci? | jen webp v `public/` |
| Právní forma — produktová řada agentury (kap. 1), nebo společná firma s Filipem? Smlouva mezi námi? | nikde |
| Ceník — platí? Byl testován? | kap. 5 |
| „Realitní turisté" — SMS/WhatsApp dokvalifikace: WhatsApp Business API je placené a schvalované; je to reálné? | kap. 12 |
| Monitoring Bazoš/Sreality — právně „data servis", ale scraping Sreality je proti jejich podmínkám; riziko blokace | kap. 19.4 |
| `Checklist_stavby_CRM.xlsx` (120 úkolů) — existuje? kde? | kap. 23 |
| Notion: kořenové poznámky chtějí „udělat umělou inteligenci – chatbot", procesy 1.2 říkají „po dni 90, nestavět" — co platí? | Notion |
| Notion: archivace kontaktů a nemovitostí — jak (stav `archivován`? skrytí?) | Notion poznámky |
| 21st.dev MCP v `.mcp.json` — používá se? | repo |
| Tmavý režim — vrátit, nebo vyčistit z kódu? Ondřej proti, Filip pro; kód zatím zůstává (3. 10.), rozhodnout při návrhu stránek | 26. 8. |
| Kancelářský segment — Q4 2026 je za rohem; pořád platí? | kap. 7, 8 |

---

## 9. Mapa „kapitola strategie → otázka" (podle Ondřejovy metodiky)

Aby strategie neměla díry, každá její kapitola musí mít zdroj. Co už máme
z dokumentů (✓) a na co se musí ptát dotazník (→ otázka v §):

| Kapitola budoucí strategie | Zdroj |
|---|---|
| Pozicování, jedna věta | ✓ kap. 1 — **ale** rozhodnout §1 (služba vs. software) |
| Problém a bolest | ✓ kap. 2 |
| Persona ideálního makléře | ✓ kap. 3 — doplnit §4 (reálný pilot jako persona) |
| Odlišení, moat | ✓ kap. 6 |
| Produkt a balíčky | ✓ kap. 5, 19 — potvrdit §6 (co zůstává navíc) |
| Hero funkce a MVP | ✓ kap. 18, 21 — rozhodnout §3 (na čem) |
| Architektura | → §1, §3 |
| Tým a kapacita | → §2, §5 |
| Roadmapa a brány | → §5 |
| Go-to-market a prodej | ✓ kap. 7 — ověřit §4 |
| Ceny | ✓ kap. 5 — ověřit §4, §8 |
| Rizika | ✓ kap. 13 — doplnit §7 |
| KPI | ✓ kap. 22 |
| Design a tón | ✓ [04](../04-design/04-design.md) — doplnit design mimo aplikaci |
| Právní, GDPR, smlouvy | → §7, §8 |

**Z toho plyne dotazník:** zhruba 12–15 otázek, hlavně k §1–§5. Formát podle
metodiky: otevřené, konkrétní, s nápovědou proč se ptáme, nic povinné, oba
zakladatelé zvlášť, pak porovnat.

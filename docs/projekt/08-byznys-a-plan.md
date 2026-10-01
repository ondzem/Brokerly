# 08 — Byznys a plán

Ceny, go-to-market, roadmapa, tým a rizika — tedy *plán*, jak misi a vizi
z [01](01-mise-a-vize.md) uskutečnit. Zdroj: master dokument kap. 5–9, 13;
Notion. Doplněno o posuny k 1. 10. 2026 (`► Stav 10/2026`). Tohle se bude
přepisovat ve strategii; mise a vize ne.

---

## 1. Obchodní model a ceny

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

## 2. Go-to-market

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

## 3. Roadmapa a cíle 2026 (z července)

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

## 4. Tým, role, pravidla provozu

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

## 5. Rizika a jak na ně

| Riziko | Odpověď |
|---|---|
| **Komoditizace** — portály/CRM si přidají auto-odpovědi | Prodávat servis a výsledek, ne scénář. Jádro hodnoty ve follow-upu majitelů a kancelářské vrstvě. Zvážit partnerství se stret.ai jako implementátor. |
| **Platformové riziko** | Nestavět na jedné automatizaci; vstup přes e-mail, ne scrapování portálových poptávek. |
| **Kvalita AI a důvěra** | Eskalace na člověka od první verze; AI odpovídá **jen z karty nemovitosti**; konzervativní triáž (nejistota = notifikace, nikdy spam). |
| **Právní šedá zóna akvizice** | Systém **nikdy sám neoslovuje** soukromé inzerenty — jen ukazuje seznam, volá makléř. Smluvně: kontaktování je odpovědnost klienta. Interně „data servis", ne outreach. |
| **Kapacita** | Studio → automatizace → asistentka. Nikdy vše naráz. |

---

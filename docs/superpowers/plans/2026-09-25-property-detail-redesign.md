# Detail nemovitosti — návrh a implementační plán

**Stav:** Připraveno ke schválení. Implementace zatím nezačala.

**Cíl:** Výrazně přepracovat kompozici otevřeného detailu nemovitosti, aby byl přehledný, příjemný a působil osobitě. Zachovat všechny současné informace, české texty, barvy, rodiny písem a funkce.

**Rozsah:** Projekt `Brokerly`, který běží na `http://localhost:5175`. Jen detail nemovitosti a jeho související vizuální stavy. Nová nemovitost slouží jako reference pro srozumitelnost a odezvu; průvodce se nepředělává.

**Technologie:** Stávající React, TypeScript, Vite, Tailwind 4 a komponenty shadcn/Base UI. Stávající Supabase a obslužné funkce zůstávají.

## Co ukázala prohlídka

- Na počítači 1280 × 720 zabírá hlavička s fotografií, parametry a záložkami přibližně 380 px; pracovní obsah začíná až kolem 420 px od horního okraje.
- Vpravo od fotografie zbývá mnoho nevyužitého místa, ale přehled financí už vyžaduje posun dolů.
- Zájemci mají dlouhé řádky s informacemi na vzdálených koncích. Bloky mají podobnou vizuální váhu.
- Informace a Provize opakují široké obdélníky pod sebou. Vytvoření nové nemovitosti naopak nabízí jasné volby a viditelnou odezvu.

## Doporučená kompozice

Na široké obrazovce detail rozdělíme na **portrét nemovitosti vlevo a pracovní obsah vpravo**. Nevznikne další krok ani nové navigační úrovně.

| Levý sloupec, přibližně 280–320 px | Pravá část, zbývající šířka |
|---|---|
| Skutečná fotografie a vstup do galerie | Přehled · Informace · Zájemci · Provize |
| Název, transakce a stav | Obsah vybrané záložky začíná hned nahoře |
| Adresa, cena a cena za m² | Důležité bloky mají rozpoznatelnou hierarchii |
| Vlastník a telefon | Úpravy zůstávají u konkrétního bloku |
| Stávající parametry a tlačítko Vše | Dlouhý obsah má dostupný přirozený posun |

Levý sloupec nebude další sadou karet: fotografie, typografie a jemné oddělovače vytvoří souvislý profil. Ovládání zavření a nabídky akcí zůstane vždy dosažitelné. Na menších šířkách přejde profil nad obsah; záložky zůstanou po ruce. Žádné vynucené zkracování adres, cen nebo názvů.

### Jednotlivé záložky

- **Přehled:** zájemci a finance se ukážou vedle sebe tam, kde mají dost prostoru. Navazující aktivita tvoří časovou osu. Hierarchii vytvoří rozložení a velikost hodnot, ne další barvy. Prázdné stavy zachovají současné texty a akce.
- **Informace:** obecné a specifické parametry dostanou kompaktní, čitelné skupiny. Poznámka a dokumenty budou vizuálně odlišitelné podle účelu. Všechny stávající hodnoty, větve podle druhu nemovitosti a editory zůstanou dostupné.
- **Zájemci:** zachovat filtry, počty, kontakt, telefon, poznámku, fázi, průběh a úpravy. Související informace budou blíž u sebe. Stávající pětibodový průběh bude čitelný a jemně reagující, bez změny jeho významu. Zachovat přidávání a možné zájemce.
- **Provize:** sazba, částka, stav, náklady a čistá provize budou tvořit zřetelnou vizuální posloupnost. Současné výpočty, znaménka, texty a editory zůstanou beze změn.

### Příjemnost při ovládání

Krátké přechody 150–200 ms při otevření, přepnutí záložky a rozbalení editoru. Fotografie a klikatelné prvky mají decentní hover a stisk; fokus je viditelný i z klávesnice. Pohyb nikdy nezdržuje přístup k údajům, nespouští se v nekonečné smyčce a respektuje `prefers-reduced-motion`. Formuláře se při vizuálních přechodech nesmějí resetovat.

### Zvažované směry

1. **Doporučeno: portrét vlevo + pracovní obsah vpravo.** Výrazná změna kompozice a více prostoru pro informace; na mobilu vyžaduje samostatně promyšlené skládání.
2. **Kompaktní vodorovná hlavička.** Jednodušší zásah, ale zachovává většinu dnešního dojmu dlouhého formuláře.
3. **Velká fotografie přes šířku.** Silnější první dojem, ale znovu odsouvá pracovní obsah; pro každodenní CRM ji nedoporučuji.

Referencí je disciplína rozložení a hierarchie z [Linear na Refero](https://styles.refero.design/style/90ce5883-bb24-4466-93f7-801cd617b0d1). Přenáší se principy, nikoli jeho barvy, fonty či marketingové efekty. Identitu určuje současný Brokerly a `docs/design-system.md`; při rozporu dokumentace s požadavkem na zachování současného vzhledu mají přednost aktuální barvy a písma aplikace.

## Implementace po schválení

Pracovat postupně v tomto úkolu. Použít `superpowers:executing-plans` a před dokončením `superpowers:verification-before-completion`.

### 1. Zaznamenat výchozí stav a funkční inventář

- [ ] Ověřit aktuální stav souborů kvůli souběžné práci druhého vývojáře.
- [ ] Zaznamenat vzhled všech čtyř záložek, nabídky akcí a editorů; zahrnout byt, dům a prázdné stavy.
- [ ] Připravit inventář současných textů, polí a akcí detailu z `src/components/PropertiesView.tsx`; kontrolovat proti němu výsledný stav.
- [ ] Spustit `npm run build` a `npm run lint`, zaznamenat případné již existující chyby.

### 2. Změnit kompozici detailu

**Soubory:** `src/components/PropertiesView.tsx`, nový `src/components/property-detail/PropertyDetailLayout.tsx`, nový `src/components/property-detail/property-detail.css`.

- [ ] Vytvořit prezentační obal přijímající React obsah pro profil, navigaci a pracovní část; bez Supabase volání a bez přesunu obchodní logiky.
- [ ] Do obalu přesunout stávající fotografii, souhrn a navigaci se stávajícími obsluhami. Zachovat dialog, chování Escape, návrat fokusu a nabídku akcí.
- [ ] Oddělit široké a úzké uspořádání podle dostupného prostoru; dlouhé názvy a adresy smějí zalomit text. Nepoužít globální změny tokenů nebo sdíleného dialogu.
- [ ] Ověřit profil a všechny záložky při šířkách 1440, 1280, 1024, 768 a 390 px, včetně nízkého okna.

### 3. Přeuspořádat obsah všech čtyř záložek

**Soubor:** `src/components/PropertiesView.tsx` a lokální styly detailu.

- [ ] Upravit mřížku Přehledu, skupiny Informací, řádky Zájemců a kompozici Provize podle návrhu výše.
- [ ] Zachovat `handleSaveGeneral`, `handleSaveSpecifics`, `handleSaveNote`, `handleSaveCommission`, `handleSaveExpense`, `handleConnectBuyer` a `handleUpdateDealInline` i jejich vstupy.
- [ ] Zachovat galerii a ořez, náhledy, nahrání, stažení a odebrání dokumentů, kopírování a odstranění nemovitosti, navigaci na vlastníka a obchody; nic z toho při vizuální kontrole nespouštět nad sdílenými daty destruktivně.
- [ ] Porovnat úplnost s inventářem: žádné odstraněné pole, český text, filtr, hodnota, výpočet nebo akce.

### 4. Doplnit odezvu a ověřit výsledek

**Soubory:** lokální styly detailu; `docs/verification/2026-09-25-property-detail-redesign.md`.

- [ ] Doplnit přechody, hover, stisk, fokus a omezení pohybu. Zachovat ovládání dotykem i klávesnicí; žádná akce nesmí být dostupná jen při hoveru.
- [ ] V prohlížeči projít otevření/zavření, všechny záložky, filtry, galerii, náhledy a otevření/zrušení editorů. Zápisy a mazání ověřovat na izolovaných testovacích datech nebo simulovaném datovém rozhraní, ne na sdílených klientských záznamech.
- [ ] Zkontrolovat dlouhé adresy, více zájemců, prázdnou galerii, chybějící údaje, dlouhé dokumenty a nulovou či zápornou čistou provizi.
- [ ] Spustit `npm run build`, `npm run lint`, `git diff --check`; provést kontrolu přístupnosti pomocí `web-design-guidelines` a vizuálně ověřit uvedené šířky.
- [ ] Zapsat výsledky a případná omezení do ověřovacího dokumentu, aktualizovat graf a vytvořit commit pouze s vlastními změnami.

## Podmínky dokončení

Všechny čtyři záložky jsou skutečně přepracované; změna není jen kosmetická úprava odsazení. Na široké obrazovce přehled začne vedle profilu, ne pod vysokou hlavičkou. Na mobilu se obsah ani ovládání neořezávají. Všechny původní informace, texty, barvy, písma a funkce zůstávají. Výsledek je zkontrolovaný vizuálně i funkčně a doložený ověřovacím dokumentem.

**Schválení:** Před změnou aplikačního kódu je potřeba souhlas s doporučenou kompozicí podle §0 projektového `AGENTS.md`.

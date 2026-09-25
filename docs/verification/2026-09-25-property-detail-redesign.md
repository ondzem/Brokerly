# Ověření redesignu detailu nemovitosti — 25. 9. 2026

## Výsledek

Detail má na desktopu samostatný profil vlevo a pracovní záložky vpravo. Přehled spojuje zájemce a finance; Informace oddělují parametry od poznámky a dokumentů; Zájemci mají samostatné čitelné karty; Provize zvýrazňuje čistou částku. Na mobilu je navigace se zavřením přichycená nahoře. Zachované rodiny písem, barvy, texty a datová logika.

## Kontroly

- Produkční sestavení `npm run build`: úspěšné, TypeScript bez chyb. Přetrvává původní upozornění na velký JS balík.
- `git diff --check`: bez chyb.
- `npm run lint`: stejně jako před změnou nelze spustit kvůli chybějícímu `eslint-config-next`. Konfigurace lintování nebyla součástí redesignu.
- Porovnání TypeScript AST proti původnímu souboru: všech 18 funkcí začínajících `handle` je identických. Žádný unikátní JSX text neodstraněn. Ručně porovnány změny JSX a zachování podmínek, hodnot, výpočtů a ovládacích prvků. Duplicitní mobilní nabídka akcí sjednocena s desktopovou.
- Vizuální kontrola skutečné aplikace na šířkách 390, 768, 1024, 1280 a 1440 px; včetně okna 1024 × 600. Na měřených šířkách 390, 768 a 1024 bez horizontálního přetečení dialogu.
- Byt se zájemci a provizí, dům bez zájemců a nenastavená provize. Zkontrolovány všechny čtyři záložky, otevření/zrušení editoru, galerie, nabídka akcí, Escape a přepnutí záložky šipkou klávesnice.
- Při kontrole opravena nedostupnost mobilního zavření po posunu a příliš zkrácený název dokumentu v úzkém sloupci.

## Izolované funkční ověření

Dočasný Vite test na portu 5176 používal původní komponentu s paměťovým rozhraním místo DB; přístup k Supabase byl blokovaný. Žádná testovací změna nešla do sdílených záznamů.

- Uložení ceny 12 → 13 mil. Kč: profil i cena za m² se aktualizovaly, vznikl správný záznam historie ceny.
- Uložení poznámky: správný obsah v předané aktualizaci.
- Provize 6 % z 13 mil. Kč: uložená částka 780 000 Kč.
- Přidání nákladu 80 000 Kč k původním 700 000 Kč: čistá provize 0 Kč. Předtím ověřena záporná i kladná hodnota.
- Úprava poznámky zájemce: správná aktualizace obchodu.
- Šest zájemců s dlouhými jmény a poznámkami; přepnutí filtru do prázdného stavu a zpět.
- Prázdná galerie, chybějící parametry a prázdné dokumenty zachovaly odpovídající stavy.

Testovací prostředí sloužilo pro chování, vizuální hodnocení proběhlo v hlavní aplikaci se skutečnými styly. Skutečné nahrávání/mazání souborů ani mazání nemovitostí nebylo spouštěno; jejich obsluhy zůstaly identické. Toto není úplný integrační test Supabase ani audit celého CRM.

## Přístupnost a odezva

Kontrola podle https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Nová navigace má tablist, tabpanel, aria-selected a ovládání šipkami/Home/End; dialog má propojený název. Ikonové akce mají popisky, přidání fotografie je samostatné tlačítko bez vnořeného interaktivního prvku. Fokus je viditelný, nové přechody respektují prefers-reduced-motion. Formulářové obsluhy a existující validace se neměnily. Globální problémy starších formulářů nejsou tímto lokálním redesignem vyřešeny.

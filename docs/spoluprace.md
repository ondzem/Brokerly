# Práce ve dvou na Brokerly

## Postup — tohle si přečtěte oba

Celá spolupráce stojí na dvou úkonech. Nic víc si pamatovat nemusíte.

| úkon | co znamená |
|---|---|
| **`brokerly`** | *„dej mi nejnovější verzi a spusť projekt"* |
| **`Ctrl + C`** | *„hotovo, pošli moji práci tomu druhému"* |

Když spustíte `brokerly`, nahoře se vypíše, **co ten druhý mezitím udělal** —
například `📥 Od minule přibylo: • Práce: PropertiesView.tsx, storage.ts (Kolega,
před 3 hodinami)`. Když se nevypíše nic, nikdo nic nenahrál.

### Jak se dostanu k jeho změnám?

Dáte `Ctrl + C` a spustíte `brokerly` znovu. Trvá to deset vteřin.

Server se totiž dívá do složky tak, jak vypadala při spuštění. Dokud běží, nové
soubory od kolegy se do ní nedostanou — stáhnou se až při dalším startu.

### Kdy to mám dělat?

**Vždycky, když se chystáte na něco sáhnout.** Ráno, po obědě, po pauze. Čím
čerstvější verzi máte, tím míň je co spojovat.

A hlavně **nedělejte tři dny práce bez jediného `Ctrl + C`.** Dokud nedáte
Ctrl + C, vaše práce leží jen u vás na počítači, kolega o ní neví a staví na
staré verzi.

### Jediné pravidlo navíc

**Řekněte si dopředu, kdo dělá co.** Stačí zpráva: „dneska dělám nemovitosti, ty
si vezmi kontakty."

Git umí spojit změny v různých souborech úplně sám. Změny na stejném řádku spojit
neumí a musí rozhodnout člověk — a to zdržuje. Tomu se vyhnete jednou větou předem.

---


Kolega **nedostane složku z disku**. Složku má GitHub — každý si ji stáhne k sobě,
pracuje u sebe a hotovou práci pošle zpět. GitHub je to jediné společné místo.

```
   Ondřej                 GitHub                 kolega
  ┌────────┐   push    ┌──────────┐   pull    ┌────────┐
  │ složka │ ────────▶ │  main    │ ────────▶ │ složka │
  │        │ ◀──────── │          │ ◀──────── │        │
  └────────┘   pull    └──────────┘   push    └────────┘
```

Posílat složku přes WeTransfer nebo disk **nedělejte**. Má 500 MB `node_modules`,
obsahuje vaše klíče a hlavně se tím ztratí historie — nešlo by pak poznat, kdo co
změnil, a změny by se nedaly spojit.

---

## Co musí udělat Ondřej (jednou)

1. **Přidat kolegu jako spolupracovníka.** Repozitář je veřejný, takže si ho kdokoli
   může stáhnout — ale *zapisovat* smí jen ten, kdo je pozvaný.

   https://github.com/ondzem/Brokerly/settings/access → *Add people* → jeho GitHub
   jméno → role **Write**. Přijde mu e-mail s pozvánkou, musí ji potvrdit.

2. **Poslat mu klíče.** Obsah souboru `.env.local` — čtyři řádky. Ten soubor je
   schválně mimo GitHub, takže se k němu jinak nedostane.

   Pošlete mu je soukromě (zpráva, správce hesel), ne do veřejného issue.

---

## Co udělá kolega (jednou)

Otevře Terminál a spustí:

```bash
git clone https://github.com/ondzem/Brokerly.git
cd Brokerly
cp .env.local.example .env.local
```

Do `.env.local` vloží klíče od Ondřeje. Pak už jen:

```bash
./start.sh
```

Skript sám doinstaluje závislosti a spustí projekt na http://localhost:5173.

---

## Denní režim — oba stejně

**Začátek práce i konec práce jsou jeden příkaz:**

```bash
./start.sh
```

Co udělá:

1. stáhne, co mezitím udělal ten druhý,
2. spustí server,
3. **po `Ctrl + C`** uloží vaši práci a nahraje ji na GitHub.

Takže: než začnete, spusťte `start.sh`. Až končíte, dejte `Ctrl + C` a počkejte,
než doběhne. Nezavírejte okno křížkem — tím se práce nenahraje.

### Jediné pravidlo, které musíte dodržet

**Nepracujte oba naráz na stejné věci.** Domluvte se předem — „dneska dělám
nemovitosti, ty kontakty". Git umí spojit změny v různých souborech automaticky;
změny na stejném řádku spojit neumí a musí to rozhodnout člověk.

Čím častěji nahráváte, tím míň je co spojovat. Klidně `Ctrl + C` a znovu `./start.sh`
i uprostřed dne.

---

## Když nastane konflikt

Skript se zastaví a řekne to. **Nic se neztratilo** a nic se nenahrálo.

Nejrychlejší řešení — otevřete v projektu Claude Code a napište:

> vyřeš prosím konflikt po rebase a dokonči ho

Když chcete zpátky do stavu před pokusem o spojení:

```bash
git rebase --abort
```

---

## Ruční příkazy (když nechcete skript)

| co chci | příkaz |
|---|---|
| stáhnout cizí změny | `git pull --rebase origin main` |
| uložit svoji práci | `git add -A && git commit -m "co jsem udělal"` |
| nahrát na GitHub | `git push origin main` |
| co mám rozdělané | `git status` |
| co se změnilo naposled | `git log --oneline -10` |

Pořadí je vždy **pull → commit → push**. Push bez předchozího pullu GitHub odmítne.

---

## Databáze je společná

Supabase je jedna pro oba. Když kolega založí nemovitost, uvidíte ji hned i vy —
nemá to nic společného s GitHubem a nepotřebuje to žádnou synchronizaci.

Pozor na druhou stranu téže mince: **co jeden smaže, je smazané i pro druhého.**
Migrace v `supabase/migrations/` pouští jen jeden z vás, ne oba.

---

## První zpráva pro kolegův Claude Code

Většinu toho, co má vědět, si jeho Claude Code přečte sám — `AGENTS.md` a
`CLAUDE.md` se načítají automaticky při každé session a §11 v AGENTS.md popisuje
právě tenhle režim práce ve dvou. Žádný dlouhý prompt tedy potřeba není.

Stačí, když do prvního chatu v projektu vloží tohle:

```text
Pracuju na projektu Brokerly společně s Ondřejem — on na svém počítači, já na
svém, sdílíme repozitář github.com/ondzem/Brokerly, větev main.

Přečti si AGENTS.md (hlavně §11 o práci ve dvou) a docs/spoluprace.md a drž se
toho po celou dobu.

Než mi cokoli poradíš nebo změníš:
1. ověř, jestli nejsem pozadu za GitHubem
2. když jsem, nejdřív stáhni změny — na starší verzi neupravuj nic

Až něco dokončíme, práci ulož commitem se srozumitelným popisem. Nikdy
nepoužívej force push ani hard reset na něco, co už je na GitHubu.

Projekt je v etapě 1 — držíme se rozsahu popsaného v AGENTS.md. Když by něco
vyžadovalo funkci z pozdější etapy, zeptej se, nestav to.
```

Víc netřeba. Zbytek si jeho Claude dohledá v repozitáři sám.

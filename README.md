# Brokerly

AI back office + CRM pro české realitní makléře. Etapa 1 — „Denní jádro":
pět propojených tabulek (kontakty, nemovitosti, obchody, aktivity, nastavení)
a čtyři denní pohledy. Zatím bez automatizací.

**Stack:** Vite + React 19 + TypeScript · Tailwind v4 · shadcn/ui · Supabase (Postgres + Storage)

---

## Spuštění

```bash
git clone https://github.com/ondzem/Brokerly.git
cd Brokerly
cp .env.local.example .env.local   # a doplňte klíče
./start.sh
```

Běží na http://localhost:5173.

`start.sh` zároveň synchronizuje s GitHubem — stáhne cizí změny při startu
a nahraje vaše po ukončení (`Ctrl + C`).

Bez skriptu: `npm install && npm run dev`.

---

## Dokumentace

| soubor | co v něm je |
|---|---|
| [AGENTS.md](AGENTS.md) | pravidla projektu — datový model, rozsah etapy 1, design systém |
| [docs/spoluprace.md](docs/spoluprace.md) | jak na projektu pracovat ve dvou |
| [docs/image-crop-uploader.md](docs/image-crop-uploader.md) | logika nahrávání a ořezu fotek (přenositelné do jiných projektů) |
| `graphify-out/GRAPH_REPORT.md` | znalostní graf repozitáře (generuje se lokálně) |

## Databáze

Supabase, jedna společná instance pro celý tým. Migrace jsou v
`supabase/migrations/` a pouští je **jen jeden člověk** — dopad je pro všechny.

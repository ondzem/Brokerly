#!/bin/bash
#
# Brokerly — start a synchronizace.
#
# Postup: stáhne cizí změny → nainstaluje závislosti → pustí server →
# po Ctrl+C uloží vaši práci a nahraje ji na GitHub.
#
# Napsané pro dva lidi na jednom repozitáři: před každým pushem se nejdřív
# stáhne, co mezitím udělal ten druhý. Když to nejde spojit automaticky,
# skript se ZASTAVÍ a nic nenahraje — raději než aby přepsal cizí práci.

set -uo pipefail
cd "$(dirname "$0")" || exit 1

BRANCH="main"

say()  { echo "$1"; }
line() { echo "----------------------------------------------"; }

echo "=============================================="
echo "        Brokerly — start a synchronizace      "
echo "=============================================="

# --- 0. Kontrola prostředí -----------------------------------------------

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  say "❌ Tahle složka není git repozitář."
  say "   Naklonujte projekt: git clone https://github.com/ondzem/Brokerly.git"
  exit 1
fi

if [ ! -f .env.local ]; then
  say "❌ Chybí soubor .env.local — bez něj se aplikace nepřipojí k databázi."
  say ""
  say "   Udělejte:  cp .env.local.example .env.local"
  say "   a doplňte klíče, které vám poslal Ondřej."
  exit 1
fi

# --- 1. Stáhnout, co udělal ten druhý ------------------------------------

say "🔄 Stahuji změny z GitHubu…"
if ! git fetch origin "$BRANCH" 2>/dev/null; then
  say "⚠️  Nepodařilo se spojit s GitHubem — pokračuji offline."
elif ! git pull --rebase --autostash origin "$BRANCH"; then
  say ""
  say "⛔ Vaše změny a změny kolegy se dostaly do konfliktu ve stejném souboru."
  say "   Git označil sporná místa přímo v souborech (<<<<<<< / >>>>>>>)."
  say ""
  say "   Nejjednodušší řešení: otevřete Claude Code a napište"
  say "   „vyřeš prosím konflikt po rebase a dokonči ho“."
  say ""
  say "   Zpátky na začátek se dostanete příkazem:  git rebase --abort"
  exit 1
else
  say "✅ Kód je aktuální."
fi

# --- 2. Závislosti --------------------------------------------------------

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  say "📦 Instaluji závislosti (chvíli to trvá)…"
  npm install || { say "❌ npm install selhal."; exit 1; }
fi

# --- 3. Server ------------------------------------------------------------

say ""
say "🚀 Spouštím vývojový server."
say "   Až budete hotovi, ukončete ho pomocí Ctrl + C — pak se práce nahraje."
line
npm run dev
line

# --- 4. Uložit a nahrát ---------------------------------------------------

say "📝 Server ukončen. Kontroluji, co jste změnili…"

if [ -z "$(git status --porcelain)" ]; then
  say "✅ Žádné změny k nahrání."
  echo "=============================================="
  exit 0
fi

git status --short
say ""
git add -A
git commit -q -m "Práce z $(date '+%-d. %-m. %Y %H:%M') — $(git config user.name)"
say "💾 Změny uloženy."

# Znovu stáhnout — kolega mohl něco nahrát, zatímco jste pracovali.
say "🔄 Stahuji cizí změny před nahráním…"
if ! git pull --rebase --autostash origin "$BRANCH"; then
  say ""
  say "⛔ Konflikt s prací kolegy. NIC jsem nenahrál — vaše změny jsou uložené"
  say "   lokálně, nepřijdete o ně."
  say ""
  say "   Otevřete Claude Code a napište: „vyřeš prosím konflikt po rebase“."
  say "   Nebo zpět na začátek:  git rebase --abort"
  exit 1
fi

if git push origin "$BRANCH"; then
  say "🎉 Nahráno na GitHub."
else
  say ""
  say "⛔ Nahrání selhalo. Vaše práce je uložená lokálně, neztratila se."
  say "   Nejčastější příčina: nemáte právo zapisovat do repozitáře."
  say "   Napište Ondřejovi, ať vás přidá: Settings → Collaborators."
  exit 1
fi

echo "=============================================="

#!/bin/bash
#
# Brokerly — start a synchronizace.
#
# Postup: uloží rozdělanou práci → stáhne cizí změny → pustí server →
# po Ctrl+C uloží a nahraje na GitHub.
#
# Napsané pro dva lidi na jednom repozitáři. Ve chvíli, kdy git nedokáže
# spojit obě práce sám, se skript ZASTAVÍ a nic nenahraje — nikdy nenahraje
# rozpracované spojení ani soubor s konfliktními značkami.

set -uo pipefail
cd "$(dirname "$0")" || exit 1

BRANCH="main"
say()  { echo "$1"; }
line() { echo "----------------------------------------------"; }

echo "=============================================="
echo "        Brokerly — start a synchronizace      "
echo "=============================================="

conflict_help() {
  say ""
  say "⛔ Vaše práce a práce kolegy se potkaly ve stejném místě a git neví,"
  say "   která verze platí. NIC jsem nenahrál — o svoje změny nepřijdete."
  say ""
  say "   Nejjednodušší: otevřete v projektu Claude Code a napište"
  say "   „vyřeš prosím konflikt a dokonči ho“."
  say ""
  say "   Zpátky do stavu před spojováním:  git rebase --abort"
  exit 1
}

# Rozdělané spojení pozná git podle neslučitelných položek v indexu.
# Grep na značky <<<<<<< nepoužíváme — máme je popsané v dokumentaci.
assert_no_conflict() {
  if [ -n "$(git ls-files --unmerged)" ] \
     || [ -e .git/MERGE_HEAD ] \
     || [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    conflict_help
  fi
}

save_work() {
  [ -z "$(git status --porcelain)" ] && return 0

  local deleted
  deleted=$(git status --porcelain | grep -c '^.D' || true)
  if [ "$deleted" -gt 0 ]; then
    say ""
    say "⚠️  Pozor, ukládám i smazání $deleted soubor(ů):"
    git status --porcelain | grep '^.D' | sed 's/^/     /'
    say "   Pokud jste je nemazali, dejte Ctrl+C a napište Ondřejovi."
    say ""
  fi

  # Do popisu commitu jdou názvy dotčených souborů. Automatický commit nemůže
  # vědět, CO se změnilo, ale KDE se to změnilo vědět může — a to je pro toho
  # druhého ráno podstatně užitečnější než datum, které si git pamatuje sám.
  local names count msg
  names=$(git status --porcelain | sed 's/^...//' | sed 's/.*-> //' \
          | xargs -n1 basename 2>/dev/null | sort -u)
  count=$(echo "$names" | grep -c . || true)
  msg=$(echo "$names" | head -3 | paste -sd',' - | sed 's/,/, /g')
  [ "$count" -gt 3 ] && msg="$msg + $((count - 3)) dalších"

  git add -A
  git commit -q -m "$1: $msg"
  say "💾 Uloženo: $msg"
}

sync_down() {
  if ! git fetch origin "$BRANCH" 2>/dev/null; then
    say "⚠️  Nepodařilo se spojit s GitHubem — pokračuji offline."
    return 1
  fi

  # Vypsat, co mezitím udělal ten druhý — jinak se to dozvíte, až vám to
  # spadne pod rukama.
  local incoming
  incoming=$(git log --pretty='   • %s  (%an, %ar)' "HEAD..origin/$BRANCH" 2>/dev/null)
  if [ -n "$incoming" ]; then
    say ""
    say "📥 Od minule přibylo:"
    echo "$incoming"
    say ""
  fi

  git pull --rebase origin "$BRANCH" || conflict_help
  assert_no_conflict
  return 0
}

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

# Repozitář zůstal po minule v rozdělaném stavu — dál nemá smysl chodit.
assert_no_conflict

# --- 1. Uložit rozdělané a stáhnout cizí ---------------------------------

save_work "Rozdělané"

say "🔄 Stahuji změny z GitHubu…"
if sync_down; then
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

if [ -z "$(git status --porcelain)" ] && git diff --quiet "origin/$BRANCH" HEAD 2>/dev/null; then
  say "✅ Žádné změny k nahrání."
  echo "=============================================="
  exit 0
fi

git status --short
save_work "Práce"

say "🔄 Stahuji cizí změny před nahráním…"
sync_down || { say "⛔ Bez připojení nemůžu nahrát. Práci máte uloženou lokálně."; exit 1; }

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

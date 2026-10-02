#!/bin/bash
#
# Automatická synchronizace s GitHubem pro Claude Code.
#
#   sync.sh pull   — volá se při startu session (SessionStart)
#   sync.sh push   — volá se po každé odpovědi Claude (Stop)
#
# Nahrávání jde pozastavit souborem .claude/.sync-paused (je v .gitignore).
# Práce se pak pořád commituje lokálně, jen se neposílá na GitHub — pro
# případ, kdy člověk nechce po každé odpovědi nový commit v repozitáři.
#
# Skript VŽDY končí kódem 0. Hook nesmí zablokovat práci: když se
# synchronizovat nedá (offline, konflikt), jen to oznámí a nechá běžet dál.
# Zprávy pro uživatele jdou ven jako JSON se systemMessage.

set -uo pipefail

# Cloud session (claude.ai/code) si větve a PR řeší sama — tam nesynchronizovat.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && exit 0
cd "$(dirname "$0")/.." 2>/dev/null || exit 0

BRANCH=main

# $1 = zpráva pro člověka, $2 = (volitelně) název události — pak dostane
# zprávu i Claude, aby věděl, že soubory pod ním nejsou takové, jak si je
# přečetl.
say() {
  python3 - "$1" "${2:-}" <<'PYEOF'
import json, sys
out = {"systemMessage": sys.argv[1], "suppressOutput": True}
if len(sys.argv) > 2 and sys.argv[2]:
    out["hookSpecificOutput"] = {
        "hookEventName": sys.argv[2],
        "additionalContext": sys.argv[1],
    }
print(json.dumps(out))
PYEOF
  exit 0
}
quiet() { echo '{"suppressOutput": true}'; exit 0; }

git rev-parse --git-dir >/dev/null 2>&1 || quiet

# Rozdělané spojení — dokud ho člověk nevyřeší, nesmíme sahat na nic dalšího.
if [ -n "$(git ls-files --unmerged 2>/dev/null)" ] \
   || [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  say "⛔ Rozpracovaný konflikt s prací kolegy — synchronizace stojí. Napište mi „vyřeš konflikt“, nebo se vraťte zpět příkazem git rebase --abort."
fi

dirty() { [ -n "$(git status --porcelain)" ]; }

# Popis commitu = názvy dotčených souborů. Automat neví CO se změnilo,
# ale KDE ano — a to je pro toho druhého užitečnější než časové razítko.
changed_files() {
  git status --porcelain | sed 's/^...//' | sed 's/.*-> //' \
    | xargs -n1 basename 2>/dev/null | sort -u
}

commit_work() {
  local names count msg
  names=$(changed_files)
  count=$(echo "$names" | grep -c . || true)
  msg=$(echo "$names" | head -3 | paste -sd',' - | sed 's/,/, /g')
  [ "$count" -gt 3 ] && msg="$msg + $((count - 3)) dalších"
  git add -A
  git commit -q -m "$1: $msg" 2>/dev/null
  echo "$msg"
}

case "${1:-}" in

  pull)
    EVENT="${2:-}"
    git fetch origin "$BRANCH" 2>/dev/null || quiet   # offline → mlčky dál

    incoming=$(git log --pretty='• %s (%an, %ar)' "HEAD..origin/$BRANCH" 2>/dev/null)
    [ -z "$incoming" ] && quiet

    dirty && commit_work "Rozdělané" >/dev/null

    if ! git pull --rebase origin "$BRANCH" >/dev/null 2>&1; then
      say "⛔ Změny od kolegy se potkaly s vašimi ve stejném místě. Napište mi „vyřeš konflikt“ — nic se neztratilo." "$EVENT"
    fi
    say "📥 Stáhl jsem změny od kolegy — soubory na disku se právě změnily, přečti si je znovu, než na ně sáhneš:
$incoming" "$EVENT"
    ;;

  push)
    # Pauza: uložit, ale nenahrávat.
    if [ -f .claude/.sync-paused ]; then
      dirty && commit_work "Práce" >/dev/null
      quiet
    fi

    ahead=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo 0)
    if ! dirty && [ "$ahead" -eq 0 ]; then quiet; fi

    what=""
    dirty && what=$(commit_work "Práce")

    git fetch origin "$BRANCH" 2>/dev/null \
      || say "📴 Bez připojení. Práce je uložená u vás, nahraje se příště."

    if ! git pull --rebase origin "$BRANCH" >/dev/null 2>&1; then
      say "⛔ Kolega mezitím změnil to samé. Nic jsem nenahrál, práce je uložená. Napište mi „vyřeš konflikt“."
    fi

    if git push origin "$BRANCH" >/dev/null 2>&1; then
      say "⬆️ Nahráno na GitHub${what:+: $what}"
    fi
    say "⚠️ Nahrání selhalo — práce je uložená u vás. Nejspíš chybí právo zapisovat do repozitáře."
    ;;

  *) quiet ;;
esac

#!/bin/bash

# Zajištění ukončení na Ctrl+C, ale zároveň spuštění ukládací části
trap 'echo "Ukončuji server..."; exit' INT

echo "=============================================="
echo "      Brokerly Auto-Sync & Start Script       "
echo "=============================================="

# 1. Stažení nejnovějších změn z GitHubu před začátkem
echo "🔄 Kontroluji změny na GitHubu..."
git fetch origin main

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse @{u} 2>/dev/null)

if [ $? -eq 0 ]; then
  if [ "$LOCAL" = "$REMOTE" ]; then
      echo "✅ Tvůj kód je aktuální."
  elif [ "$LOCAL" = "$(git merge-base HEAD @{u} 2>/dev/null)" ]; then
      echo "📥 Stahuji nové změny z GitHubu..."
      git pull origin main
  else
      echo "⚠️ Máš lokální změny, které nejsou na GitHubu."
  fi
else
  echo "⚠️ Nepodařilo se ověřit stav vzdáleného repozitáře (zkontroluj připojení)."
fi

echo ""
# 2. Spuštění vývojového serveru
echo "🚀 Spouštím vývojový server (npm run dev)..."
echo "Pro ukončení serveru stiskni Ctrl + C."
echo "----------------------------------------------"

npm run dev

echo "----------------------------------------------"
# 3. Po ukončení serveru automaticky odešleme změny zpět na GitHub
echo "📝 Vývojový server ukončen. Hledám neuložené změny..."

# Zkontrolujeme, zda jsou v projektu nějaké upravené nebo nové soubory
if [[ -n $(git status -s) ]]; then
    echo "⚡ Nalezeny neuložené změny. Nahrávám na GitHub..."
    git add .
    git commit -m "Automatická záloha - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "🎉 Změny byly úspěšně odeslány na GitHub!"
else
    echo "✅ Žádné změny k nahrání."
fi

echo "=============================================="
echo "            Synchronizace dokončena           "
echo "=============================================="

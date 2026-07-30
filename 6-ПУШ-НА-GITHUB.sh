#!/bin/bash
# Запуск в Терминале:  bash ~/Desktop/Гонки/6-ПУШ-НА-GITHUB.sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

GITHUB_REPO="https://github.com/vladimircoastsmoke-stack/origonki.git"

echo ""
echo "🏁  ОриГonki — отправка на GitHub"
echo "══════════════════════════════════════"
echo ""

if ! command -v git &>/dev/null; then
  echo "❌ Git не установлен: xcode-select --install"
  read -r -p "Enter..."
  exit 1
fi

if [ ! -d .git ]; then
  git init
  git branch -M main
fi

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$GITHUB_REPO"
else
  git remote add origin "$GITHUB_REPO"
fi

echo "📡 $GITHUB_REPO"
echo ""

if [ -n "$(git status --porcelain)" ]; then
  echo "💾 Сохраняю изменения..."
  git add -A
  git commit -m "ОриГonki: обновление"
fi

echo "📤 Отправляю на GitHub..."
echo "   (пароль = Personal Access Token с github.com/settings/tokens)"
echo ""

if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  gh auth setup-git 2>/dev/null || true
fi

git push -u origin main

echo ""
echo "✅ Готово! Код на GitHub."
echo ""
echo "👉 Следующий шаг — в Терминале:"
echo "   bash ~/Desktop/Гонки/2-ДЕПЛОЙ-НА-RENDER.command"
echo "   (или двойной клик по 2-ДЕПЛОЙ-НА-RENDER.command)"
echo ""

open "https://github.com/vladimircoastsmoke-stack/origonki" 2>/dev/null || true
read -r -p "Enter..."

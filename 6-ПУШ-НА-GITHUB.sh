#!/bin/bash
# Запуск: bash ~/Desktop/Гонки/6-ПУШ-НА-GITHUB.sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

GITHUB_REPO="https://github.com/vladimircoastsmoke-stack/origonki.git"
GITHUB_USER="vladimircoastsmoke-stack"

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

if [ -n "$(git status --porcelain)" ]; then
  echo "💾 Сохраняю изменения..."
  git add -A
  git commit -m "ОриГonki: обновление"
fi

echo ""
echo "📡 Репозиторий: $GITHUB_REPO"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ТОКЕН — создайте CLASSIC (не fine-grained!):"
echo "  https://github.com/settings/tokens/new"
echo "  → Generate new token (CLASSIC)"
echo "  → галочка: repo"
echo "  → Generate → скопировать"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "⚠️  В обычном Password символы НЕ ВИДНЫ — кажется что не вставилось."
echo "    Здесь токен будет ВИДЕН — вставьте Cmd+V и проверьте:"
echo ""

read -r -p "Вставьте токен сюда и Enter: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Токен пустой. Запустите скрипт снова."
  read -r -p "Enter..."
  exit 1
fi

echo ""
echo "📤 Отправляю на GitHub..."

# Push с токеном в URL (обходит невидимый Password)
git push "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/vladimircoastsmoke-stack/origonki.git" main

# Вернём чистый remote без токена в истории
git remote set-url origin "$GITHUB_REPO"

echo ""
echo "✅ Готово! Код на GitHub."
echo "   https://github.com/vladimircoastsmoke-stack/origonki"
echo ""
echo "👉 Следующий шаг:"
echo "   bash ~/Desktop/Гонки/2-ДЕПЛОЙ-НА-RENDER.command"
echo ""

open "https://github.com/vladimircoastsmoke-stack/origonki" 2>/dev/null || true
read -r -p "Enter..."

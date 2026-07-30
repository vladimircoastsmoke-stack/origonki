#!/bin/bash
# Отправка ОриГonki на GitHub — двойной клик
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

# ← ваш репозиторий (можно поменять)
GITHUB_REPO="https://github.com/vladimircoastsmoke-stack/origonki.git"

echo ""
echo "🏁  ОриГonki — отправка на GitHub"
echo "══════════════════════════════════════"
echo ""

if ! command -v git &>/dev/null; then
  echo "❌ Git не установлен. Установите Xcode Command Line Tools:"
  echo "   xcode-select --install"
  read -r -p "Нажмите Enter..."
  exit 1
fi

if [ ! -d .git ]; then
  echo "📁 Инициализирую git..."
  git init
  git branch -M main
fi

# Подключаем remote
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$GITHUB_REPO"
else
  git remote add origin "$GITHUB_REPO"
fi

echo "📡 Репозиторий: $GITHUB_REPO"
echo ""

# Коммит изменений (если есть)
if [ -n "$(git status --porcelain)" ]; then
  echo "💾 Сохраняю изменения..."
  git add -A
  git commit -m "ОриГonki: обновление"
fi

echo "📤 Отправляю на GitHub..."
echo ""

# Способ 1: GitHub CLI (если установлен и залогинен)
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  echo "   (через GitHub CLI)"
  gh auth setup-git 2>/dev/null || true
  git push -u origin main
else
  # Способ 2: обычный git push
  echo "   При запросе пароля вставьте Personal Access Token:"
  echo "   https://github.com/settings/tokens → Generate (classic) → repo"
  echo ""
  git push -u origin main
fi

echo ""
echo "✅ Код на GitHub!"
echo "   $GITHUB_REPO"
echo ""
echo "Следующий шаг — деплой на Render:"
echo "   Дважды кликните: 2-ДЕПЛОЙ-НА-RENDER.command"
echo ""

open "https://github.com/vladimircoastsmoke-stack/origonki" 2>/dev/null || true

read -r -p "Нажмите Enter, чтобы закрыть..."

#!/bin/bash
# Общая обёртка для всех «кликабельных» команд
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

if command -v pnpm &>/dev/null; then
  PNPM="pnpm"
else
  PNPM="npx pnpm@9.15.0"
fi

CMD="${1:-help}"

case "$CMD" in
  share)
    echo ""
    echo "🏎️  Голосовые гонки — публичный URL для теста с другом"
    echo "   (не закрывайте это окно, пока играете!)"
    echo ""
    $PNPM share
    ;;
  dev)
    echo ""
    echo "🏎️  Локальный запуск (admin + экран + игроки + сервер)"
    echo ""
    $PNPM dev
    ;;
  deploy)
    node "$ROOT/scripts/deploy-render.mjs"
    ;;
  prod)
    echo ""
    echo "🏎️  Production-сборка и запуск на localhost:3001"
    echo ""
    $PNPM build:prod
    echo ""
    echo "✅ Откройте: http://localhost:3001/admin/"
    echo ""
    NODE_ENV=production node apps/server/dist/index.js
    ;;
  help|*)
    echo ""
    echo "Decibel Racing — команды:"
    echo "  share   — публичный HTTPS для теста с другом"
    echo "  dev     — локальная разработка"
    echo "  deploy  — деплой на Render (постоянный URL)"
    echo "  prod    — локальный production"
    echo ""
    ;;
esac

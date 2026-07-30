#!/bin/bash
# Общая обёртка для всех «кликабельных» команд
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

# Используем локальный pnpm из node_modules (без лишних вопросов npx)
if [ -x "$ROOT/node_modules/.bin/pnpm" ]; then
  PNPM="$ROOT/node_modules/.bin/pnpm"
elif command -v pnpm &>/dev/null; then
  PNPM="pnpm"
else
  PNPM="npx --yes pnpm@9.15.0"
fi

CMD="${1:-help}"

# Освобождаем порт 3001 если занят (старый сервер)
free_port() {
  local pid
  pid=$(lsof -ti :3001 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "⚠️  Порт 3001 занят — останавливаю старый процесс..."
    kill $pid 2>/dev/null || true
    sleep 1
  fi
}

case "$CMD" in
  share)
    free_port
    echo ""
    echo "🏎️  Голосовые гонки — публичный URL для теста с другом"
    echo "   (не закрывайте это окно, пока играете!)"
    echo ""
    $PNPM share
    ;;
  iphone)
    free_port
    echo ""
    echo "📱 Голосовые гонки — тест на iPhone (HTTPS)"
    echo ""
    $PNPM iphone
    ;;
  wifi)
    free_port
    echo ""
    echo "📶 Голосовые гонки — тест в локальной Wi-Fi сети"
    echo "   Друг должен быть в той же Wi-Fi что и вы"
    echo ""
    if [ ! -d "$ROOT/apps/server/public" ]; then
      $PNPM build:prod
    fi
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "  ✅ Сервер запущен! Друг подключается по Wi-Fi:"
    echo "════════════════════════════════════════════════════════"
    echo "  Admin:   http://${IP:-ВАШ_IP}:3001/admin/"
    echo "  Player:  http://${IP:-ВАШ_IP}:3001/join/КОД"
    echo "  Screen:  http://${IP:-ВАШ_IP}:3001/screen/?room=КОД"
    echo "════════════════════════════════════════════════════════"
    echo ""
    NODE_ENV=production node apps/server/dist/index.js
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
  autodeploy)
    bash "$ROOT/scripts/autodeploy.sh"
    ;;
  prod)
    free_port
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
    echo "  iphone  — тест на iPhone (HTTPS + микрофон)"
    echo "  wifi    — тест в локальной Wi-Fi (Android)"
    echo "  dev     — локальная разработка"
    echo "  deploy      — первый деплой на Render (Blueprint)"
    echo "  autodeploy  — авто-деплой: сборка + push → Render пересобирает"
    echo "  prod    — локальный production"
    echo ""
    ;;
esac

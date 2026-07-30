#!/bin/bash
# Запуск: bash 5-ТЕСТ-НА-IPHONE.sh
cd "$(dirname "$0")"
echo ""
echo "📱 Голосовые гонки — тест на iPhone (HTTPS)"
echo "   ngrok не нужен — используем Pinggy/localhost.run"
echo ""
node scripts/iphone.mjs

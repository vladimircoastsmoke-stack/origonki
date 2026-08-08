#!/bin/bash
# Деплой / обновление на VPS. Из корня репозитория:
#   bash deploy/regru/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if ! command -v docker &>/dev/null; then
  echo "Сначала: bash deploy/regru/setup-server.sh"
  exit 1
fi

echo "==> Сборка и запуск..."
if [ -f deploy/regru/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source deploy/regru/.env
  set +a
fi

docker compose -f deploy/regru/docker-compose.yml up -d --build

echo ""
echo "✅ Приложение на порту 3001 (через Caddy — 80/443)"
echo "   Проверка: curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/admin/"
echo ""
echo "Когда DNS origonki.ru → IP сервера:"
echo "   https://origonki.ru/admin/"

#!/bin/bash
# Создаёт deploy/regru/.env с паролем офиса (без nano)
# Использование: bash deploy/regru/set-password.sh ВАШ_ПАРОЛЬ
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PASS="${1:?Укажите пароль: bash deploy/regru/set-password.sh 123456}"

printf 'SUPERADMIN_PASSWORD=%s\n' "$PASS" > "$DIR/.env"
echo "✅ Файл deploy/regru/.env создан"

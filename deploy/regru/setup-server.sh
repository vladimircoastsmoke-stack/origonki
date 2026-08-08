#!/bin/bash
# Первичная настройка VPS Reg.ru (Ubuntu). Запуск на сервере от root:
#   curl -fsSL ... | bash
# или после git clone:
#   bash deploy/regru/setup-server.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Обновление системы..."
apt-get update -y
apt-get upgrade -y

echo "==> Docker..."
apt-get install -y docker.io docker-compose-v2 git curl
systemctl enable docker
systemctl start docker

echo "==> Готово. Дальше:"
echo "   git clone https://github.com/vladimircoastsmoke-stack/origonki.git"
echo "   cd origonki && bash deploy/regru/deploy.sh"

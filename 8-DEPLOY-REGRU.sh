#!/bin/bash
cd "$(dirname "$0")"
cat <<'EOF'

══════════════════════════════════════════════════════════
  ОриГonki — деплой на Reg.ru (origonki.ru)
══════════════════════════════════════════════════════════

ШАГ 1 — DNS (Reg.ru → origonki.ru)

  A  @    →  IP VPS (89.108.70.189)
  A  www  →  IP VPS

ШАГ 2 — SSH

  ssh root@89.108.70.189

ШАГ 3 — на сервере

  apt update && apt install -y docker.io docker-compose-v2 git
  systemctl enable docker && systemctl start docker
  git clone https://github.com/vladimircoastsmoke-stack/origonki.git
  cd origonki
  cp deploy/regru/.env.example deploy/regru/.env
  nano deploy/regru/.env   # SUPERADMIN_PASSWORD=ваш_пароль
  bash deploy/regru/deploy.sh

ШАГ 4 — адреса

  https://origonki.ru/superadmin/  — офис модератора (вы)
  https://origonki.ru/host/КОД     — вход покупателя (+ пароль)
  https://origonki.ru/admin/       — панель организатора
  https://origonki.ru/join/КОД     — игроки

Render пока не отключаем.

EOF

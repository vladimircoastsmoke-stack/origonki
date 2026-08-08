#!/bin/bash
cat <<'EOF'

══════════════════════════════════════════════════════════
  ОриГonki — деплой на Reg.ru (origonki.ru)
══════════════════════════════════════════════════════════

ШАГ 1 — DNS (Reg.ru → origonki.ru)

  A  @    →  89.108.70.189
  A  www  →  89.108.70.189

ШАГ 2 — SSH с Mac

  ssh root@89.108.70.189

ШАГ 3 — на сервере (копируйте блок целиком)

  apt update && apt install -y docker.io docker-compose-v2 git
  systemctl enable docker && systemctl start docker
  git clone https://github.com/vladimircoastsmoke-stack/origonki.git
  cd origonki
  cp deploy/regru/.env.example deploy/regru/.env
  nano deploy/regru/.env
  bash deploy/regru/deploy.sh

  В nano: строка SUPERADMIN_PASSWORD=ваш_пароль_офиса
  Сохранить: Ctrl+O, Enter, Ctrl+X

ШАГ 4 — проверка

  docker ps
  Откройте: https://origonki.ru/superadmin/

Адреса после деплоя:

  https://origonki.ru/superadmin/  — ваш офис (создаёте организаторов)
  https://origonki.ru/host/КОД     — вход организатора (+ пароль)
  https://origonki.ru/admin/       — панель игры
  https://origonki.ru/join/КОД     — телефоны игроков
  https://origonki.ru/screen/?room=КОД — большой экран

Render (decibel-racing.onrender.com) пока оставляем как запасной.

Подробнее: deploy/regru/README.md

EOF

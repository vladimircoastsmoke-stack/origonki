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

ШАГ 3 — на сервере (одна команда, без nano)

  cd ~/origonki
  git pull
  bash deploy/regru/set-password.sh ВАШ_ПАРОЛЬ
  bash deploy/regru/deploy.sh

  Пример: bash deploy/regru/set-password.sh 588670936

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

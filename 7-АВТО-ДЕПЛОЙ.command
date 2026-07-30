#!/bin/bash
# Авто-деплой: сборка → GitHub → Render сам пересобирает
cd "$(dirname "$0")"
chmod +x scripts/click.sh 2>/dev/null
node scripts/autodeploy.mjs

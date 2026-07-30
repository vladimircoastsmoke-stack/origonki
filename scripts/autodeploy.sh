#!/bin/bash
# Авто-деплой: сборка → GitHub → Render пересобирает
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

if ! command -v node &>/dev/null; then
  echo "❌ Node.js не установлен: https://nodejs.org"
  read -r -p "Enter..."
  exit 1
fi

node scripts/autodeploy.mjs

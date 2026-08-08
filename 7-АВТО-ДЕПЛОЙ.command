#!/bin/bash
# Авто-деплой: сборка → GitHub → Render сам пересобирает
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"
bash scripts/autodeploy.sh

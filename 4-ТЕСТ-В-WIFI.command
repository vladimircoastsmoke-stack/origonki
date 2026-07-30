#!/bin/bash
cd "$(dirname "$0")"
chmod +x scripts/click.sh 2>/dev/null
./scripts/click.sh wifi
echo ""
read -p "Нажмите Enter для закрытия..."

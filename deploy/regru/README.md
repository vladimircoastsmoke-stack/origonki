# Деплой на Reg.ru (origonki.ru)

Эта папка — **только для сервера** (VPS 89.108.70.189). На Mac сюда обычно не заходят.

## Быстрый старт на сервере

```bash
git clone https://github.com/vladimircoastsmoke-stack/origonki.git
cd origonki
cp deploy/regru/.env.example deploy/regru/.env
nano deploy/regru/.env          # SUPERADMIN_PASSWORD=...
bash deploy/regru/deploy.sh
```

## Файлы

| Файл | Назначение |
|------|------------|
| `deploy.sh` | Главный скрипт — запускает Docker |
| `docker-compose.yml` | Контейнеры: приложение + Caddy (HTTPS) |
| `Caddyfile` | Домен origonki.ru → порт 3001 |
| `.env.example` | Шаблон — скопировать в `.env` |
| `setup-server.sh` | Первичная настройка VPS (Docker, git) |

## Обновление после изменений в коде

```bash
cd ~/origonki
git pull
bash deploy/regru/deploy.sh
```

## Проверка

```bash
docker ps
curl -I https://origonki.ru/superadmin/
```

Инструкция для Mac: двойной клик **8-ДЕПЛОЙ-НА-REGRU.command** в корне проекта.

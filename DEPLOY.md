# 🚀 Деплой Decibel Racing

## ⚡ Быстрый тест с другом ПРЯМО СЕЙЧАС (2 минуты)

Один URL для всего — admin, экран, игроки, сервер.

```bash
pnpm share
```

Появится публичный HTTPS-адрес вида `https://xxxx.trycloudflare.com`

| Кто | URL |
|-----|-----|
| Вы (admin) | `https://xxxx.trycloudflare.com/admin/` |
| Большой экран | `https://xxxx.trycloudflare.com/screen/?room=КОД` |
| Друг (игрок) | `https://xxxx.trycloudflare.com/join/КОД` |

QR-код в админке автоматически будет с правильной ссылкой.

> ⚠️ Туннель работает пока запущен терминал. Для постоянного URL — деплой на Render ниже.

---

## 🌐 Постоянный деплой на Render (бесплатно)

**Netlify не подходит** — нужен WebSocket-сервер. Всё деплоится одним Docker-контейнером.

### Вариант A: через GitHub (рекомендуется)

```bash
# 1. Создайте репо на github.com/new (название: decibel-racing)

# 2. Запушьте код:
git add .
git commit -m "Decibel Racing"
git remote add origin https://github.com/ВАШ_ЛОГИН/decibel-racing.git
git push -u origin main

# 3. Откройте https://dashboard.render.com/blueprints
#    → New Blueprint Instance → подключите репо
#    → Render прочитает render.yaml и задеploит (~5 мин)

# 4. Получите URL: https://decibel-racing-xxxx.onrender.com
```

### Вариант B: через Render CLI

```bash
brew install render          # Mac
render login
render deploy
```

---

## 📱 После деплоя

1. **Admin:** `https://ВАШ-URL.onrender.com/admin/`
2. Создайте комнату → скопируйте код
3. **Big Screen:** `https://ВАШ-URL.onrender.com/screen/?room=КОД`
4. **Друг:** QR-код или `https://ВАШ-URL.onrender.com/join/КОД`

---

## Локальная production-сборка

```bash
pnpm build:prod
pnpm start:prod
# → http://localhost:3001/admin/
```

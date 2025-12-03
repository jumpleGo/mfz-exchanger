# MFZ Exchanger

Обменник криптовалют MFZ - приложение для обмена криптовалюты и фиатных средств.

## Требования

- Node.js 18+
- npm или yarn

## Установка

```bash
# Установить зависимости
npm install
```

## Настройка

Создайте файл `.env` в корне проекта на основе `.env.example`:

```env
databaseURL=your_firebase_database_url
ASSETS_IMAGE_BUCKET=your_assets_bucket_url
SITE_URL=http://localhost:8081
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
```

### Telegram Mini App

Проект интегрирован с Telegram Mini App для уведомлений о заявках:

1. **Создайте бота через @BotFather**
2. **Создайте Mini App**: `/newapp` 
3. **Настройте webhook**: `./scripts/setup-telegram-webhook.sh`

**Автоматические функции:**
- ✅ Автозаполнение поля telegram из данных пользователя
- ✅ Сохранение пользователя в БД при первом открытии
- ✅ Уведомления с кнопками прямо в Telegram чате
- ✅ Синхронизация статуса между Mini App и чатом

Подробнее см.:
- [TELEGRAM_MINI_APP.md](./TELEGRAM_MINI_APP.md) - Интеграция Mini App
- [TELEGRAM_ORDER_NOTIFICATIONS.md](./TELEGRAM_ORDER_NOTIFICATIONS.md) - Уведомления о заявках

## Деплой

Полная инструкция по деплою на продакшен с настройкой Telegram webhook:

📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - VPS, Docker, PM2, CI/CD

**Быстрый старт для VPS:**
```bash
npm run build
pm2 start ecosystem.config.js
./scripts/setup-production-webhook.sh YOUR_BOT_TOKEN https://your-domain.com
```

**Быстрый старт для Docker:**
```bash
cp .env.example .env
# Заполните .env
./scripts/docker-run.sh
./scripts/setup-production-webhook.sh YOUR_BOT_TOKEN https://your-domain.com
```

## Запуск

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

Приложение будет доступно по адресу: http://localhost:8081

## Структура проекта

- `/components` - Vue компоненты
  - `/App` - Универсальные UI компоненты
  - `/Exchanger` - Компоненты обменника
- `/composables` - Переиспользуемые композабл-функции
- `/stores` - Pinia хранилища
- `/pages` - Страницы приложения (file-based routing)
- `/api` - API интеграции
- `/helpers` - Вспомогательные функции
- `/style` - Глобальные стили
- `/layouts` - Лейауты страниц
- `/middleware` - Middleware для маршрутов
- `/plugins` - Nuxt плагины

## Технологии

- Nuxt 3
- Vue 3
- Pinia (state management)
- Firebase Realtime Database
- Vuelidate (валидация форм)
- Tailwind CSS
- SCSS
- Maska (маски ввода)
- Axios

## Лицензия

Private

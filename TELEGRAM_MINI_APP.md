# Telegram Mini App Integration

## Настройка

### 1. Переменные окружения (.env)

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username
```

### 2. Настройка бота через BotFather

1. Создайте бота: `/newbot`
2. Создайте Mini App: `/newapp`
3. Укажите Web App URL: `https://your-domain.com` или ngrok URL
4. Получите токен: `/mybots` → выбрать бота → API Token

### 3. Разработка с ngrok

```bash
# Запустите dev server
npm run dev

# В другом терминале запустите ngrok
ngrok http 8081

# Используйте ngrok URL в настройках Mini App
```

## Использование

### Базовая инициализация

Telegram WebApp SDK автоматически инициализируется через плагин `telegram.client.ts`.

### Автозаполнение данных пользователя

При открытии в Telegram Mini App автоматически заполняется:
- **Поле telegram** - username или first_name пользователя (readonly)
- Данные берутся из `telegramWebApp.initDataUnsafe.user`

Реализовано в `RightExchangerBlock.vue`:
```typescript
onMounted(() => {
  if (isTelegramBrowser.value) {
    const telegramUser = getTelegramUserData()
    if (telegramUser?.username) {
      model.telegram = telegramUser.username
    } else if (telegramUser?.first_name) {
      model.telegram = telegramUser.first_name.replace(/\s+/g, '')
    }
  }
})
```

### В компонентах

```vue
<script setup lang="ts">
const { 
  telegramWebApp, 
  isTelegramBrowser,
  isFullscreen,
  showAlert,
  hapticFeedback 
} = useTelegramWebApp()

const { 
  telegramUser,
  validateTelegramData,
  sendNotification 
} = useTelegramAuth()

onMounted(async () => {
  if (isTelegramBrowser.value) {
    await validateTelegramData()
    console.log('Telegram user:', telegramUser.value)
  }
})

const handleClick = () => {
  hapticFeedback('light')
  showAlert('Привет из Telegram!')
}
</script>
```

### Обертка с темой Telegram

```vue
<template>
  <TelegramWrapper>
    <div>Ваш контент адаптируется под тему Telegram</div>
  </TelegramWrapper>
</template>
```

### Отправка уведомлений

```vue
<script setup lang="ts">
const { sendNotification } = useTelegramAuth()

const notifyUser = async () => {
  await sendNotification('Ваша заявка обработана!')
}
</script>
```

## API Endpoints

### POST /api/telegram/validate

Валидирует initData от Telegram.

**Body:**
```json
{
  "initData": "query_id=xxx&user=xxx&hash=xxx"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 123456789,
    "first_name": "John",
    "username": "john_doe"
  },
  "authDate": "1234567890"
}
```

### POST /api/telegram/sendNotification

Отправляет сообщение пользователю через бота.

**Body:**
```json
{
  "telegramId": 123456789,
  "message": "Ваше сообщение"
}
```

## Composables

### useTelegramWebApp()

- `telegramWebApp` - объект Telegram WebApp API
- `isTelegramReady` - готовность SDK
- `isTelegramBrowser` - открыто ли в Telegram
- `isFullscreen` - режим fullscreen
- `initTelegramWebApp()` - инициализация
- `waitForTelegram()` - ожидание загрузки SDK
- `showAlert(message)` - показать alert
- `showConfirm(message)` - показать confirm
- `hapticFeedback(style)` - вибрация
- `openLink(url)` - открыть ссылку
- `closeTelegramApp()` - закрыть приложение

### useTelegramAuth()

- `telegramUser` - данные пользователя Telegram
- `isValidated` - валидирован ли пользователь
- `validateTelegramData()` - валидация через сервер
- `sendNotification(message)` - отправка уведомления
- `getTelegramUserData()` - получение данных пользователя

## CSS Переменные

При открытии в Telegram доступны переменные темы:

```css
--tg-bg-color
--tg-text-color
--tg-hint-color
--tg-link-color
--tg-button-color
--tg-button-text-color
--tg-secondary-bg-color
```

## Safe Area

Для fullscreen режима используйте:

```css
padding-top: env(safe-area-inset-top, 0px);
padding-bottom: env(safe-area-inset-bottom, 0px);
```

## Отладка

### Desktop

1. Chrome DevTools
2. Console фильтр: `[Telegram`

### Mobile

- **Android**: Chrome DevTools → `chrome://inspect`
- **iOS**: Safari → Разработка → выбрать устройство

### Логи

- `[Telegram WebApp]` - инициализация SDK
- `[Telegram Plugin]` - работа плагина
- `[Telegram Auth]` - авторизация и валидация

## Важно

1. **Кэширование**: Telegram агрессивно кэширует. После изменений:
   - Полностью закройте приложение
   - Перезапустите Telegram
   - Иногда нужна очистка кэша

2. **HTTPS**: Mini App работает только по HTTPS (локально через ngrok)

3. **viewport-fit=cover**: Критично для поддержки safe-area

4. **Токен бота**: Должен быть от того же бота, где настроен Mini App

## Работа с заявками

### Получение заявки по deeplink

При открытии Mini App через кнопку в уведомлении, параметр `startapp` содержит ID заявки:

```
https://t.me/mfz_exchanger_bot/app?startapp=order_-NxXxXxXxXxXx
```

В приложении обрабатывайте параметр:

```typescript
const { telegramWebApp } = useTelegramWebApp()

onMounted(() => {
  const startParam = telegramWebApp.value?.initDataUnsafe?.start_param
  
  if (startParam?.startsWith('order_')) {
    const orderId = startParam.replace('order_', '')
    // Загрузить и показать заявку
    loadOrder(orderId)
  }
})
```

### Синхронизация статуса

Заявки синхронизируются автоматически:
- **В Telegram** - сообщение обновляется при смене статуса
- **В Mini App** - используется Firebase Realtime Database для real-time обновлений
- **Кнопка "Я оплатил"** - обновляет статус через webhook, что триггерит обновление в обоих местах

См. подробнее: [TELEGRAM_ORDER_NOTIFICATIONS.md](./TELEGRAM_ORDER_NOTIFICATIONS.md)

## Ссылка на Mini App

```
https://t.me/YOUR_BOT_USERNAME/YOUR_APP_SHORT_NAME
```

Пример:
```
https://t.me/mfz_exchanger_bot/app
```

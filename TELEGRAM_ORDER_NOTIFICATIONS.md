# Telegram Уведомления о заявках

## Описание

Система автоматических уведомлений в Telegram Bot о статусе заявок обменника. Сообщения обновляются в рамках одной заявки, а не отправляются новые.

## Возможности

### 🔔 Уведомления пользователю

1. **При создании заявки** (`status: created`)
   - Отправляется сообщение с деталями заявки
   - Кнопка "✅ Я оплатил" для подтверждения оплаты
   - Кнопка "📱 Открыть заявку" для перехода в Mini App

2. **При оплате заявки** (`status: done`)
   - Сообщение обновляется (не новое!)
   - Статус меняется на "Оплачена, в обработке"
   - Кнопка "Я оплатил" исчезает
   - Остается только кнопка "Открыть заявку"

3. **При выполнении заявки** (`status: payed`)
   - Сообщение обновляется
   - Статус меняется на "Выполнена"
   - Эмодзи меняется на ✅

4. **При отклонении/таймауте** (`status: rejected/timeout`)
   - Сообщение обновляется с соответствующим статусом

## Архитектура

### Автоматическое сохранение пользователей

При первом открытии Mini App пользователь **автоматически сохраняется** в Firebase:
- Происходит в плагине `telegram.client.ts`
- Сохраняется в `telegramUsers/{userId}`
- Это позволяет отправлять уведомления по username

```typescript
// plugins/telegram.client.ts
const user = telegramWebApp.value?.initDataUnsafe?.user
if (user?.id) {
  await $fetch('/api/telegram/saveUser', {
    method: 'POST',
    body: { telegramUser: user }
  })
}
```

### Server API

#### `/api/telegram/sendOrderNotification`
**POST** - Отправка нового уведомления о заявке

**Body:**
```json
{
  "transaction": {
    "sell": "usdt",
    "buy": "ton",
    "countSell": 100,
    "countBuy": 50,
    "address": "UQxxx...",
    "net": "TON",
    "telegram": "username",
    "status": "created",
    "id": 1234567890
  },
  "transactionKey": "-NxXxXxXxXxXx"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": 123,
  "chatId": 456789
}
```

**Логика:**
- Ищет `chatId` по username в Firebase (`telegramUsers/`)
- Если не найден - пропускает отправку (пользователь еще не открывал бота)
- Отправляет сообщение с inline кнопками
- Возвращает `messageId` и `chatId` для сохранения в транзакции

#### `/api/telegram/updateOrderNotification`
**POST** - Обновление существующего уведомления

**Body:**
```json
{
  "transaction": {
    "telegramMessageId": 123,
    "telegramChatId": 456789,
    "status": "done",
    ...
  },
  "transactionKey": "-NxXxXxXxXxXx"
}
```

**Логика:**
- Использует `editMessageText` API Telegram
- Обновляет текст и кнопки без создания нового сообщения
- Если сообщение не найдено - отправляет новое

#### `/api/telegram/webhook`
**POST** - Webhook для обработки нажатий кнопок

**Обрабатывает:**
- `callback_query` - нажатие inline кнопок
  - `order_paid_{key}` - обновляет статус на `done`
- `message` - сохраняет пользователя в БД

### Composables

#### `useTelegramOrderNotifications()`

```typescript
const { sendOrderCreated, updateOrderStatus } = useTelegramOrderNotifications()

// При создании заявки
const response = await sendOrderCreated(transaction, transactionKey)
if (response?.messageId) {
  // Сохранить messageId и chatId в транзакцию
}

// При обновлении статуса
await updateOrderStatus(updatedTransaction, transactionKey)
```

## Интеграция

### 1. При создании заявки
`components/Exchanger/RightExchangerBlock.vue`

```typescript
const sendForm = async () => {
  const transactionRef = await Setter.pushToDb("transactions", payload)
  const transactionKey = transactionRef.key
  
  // Отправить Telegram уведомление
  const telegramResponse = await sendOrderCreated(payload, transactionKey)
  
  // Сохранить messageId для будущих обновлений
  if (telegramResponse?.messageId) {
    await Setter.updateToDb({
      [`transactions/${transactionKey}/telegramMessageId`]: telegramResponse.messageId,
      [`transactions/${transactionKey}/telegramChatId`]: telegramResponse.chatId,
    })
  }
}
```

### 2. Автозаполнение поля telegram
`components/Exchanger/RightExchangerBlock.vue`

При открытии в Telegram Mini App поле telegram **автоматически заполняется**:

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

// Поле становится readonly
const isTelegramAutoFilled = computed(() => {
  return isTelegramBrowser.value && model.telegram.length > 0
})
```

### 3. При изменении статуса
`components/Exchanger/TransactionBlock.vue`

```typescript
// Обновление через кнопки UI
const cancel = async (status: "done" | "rejected") => {
  await Setter.updateToDb(updates)
  
  // Обновить Telegram сообщение
  await updateOrderStatus(
    { ...activeTransaction.value, status },
    activeTransaction.value.key
  )
}

// Обновление из Firebase (когда админ меняет статус)
watch(valueTransaction, async (val) => {
  if (val.status === "payed") {
    await updateOrderStatus(
      { ...activeTransaction.value, status: "payed" },
      activeTransaction.value.key
    )
  }
})
```

## Формат сообщений

### Статус: created
```
🆕 Заявка #abc123

📊 Статус: Ожидает оплаты

💸 Отдаёте: 100 USDT
💰 Получаете: 50 TON

📬 Адрес: UQxxx...xxx
🌐 Сеть: TON

Заявка создана: 02.12.2025, 19:56:00

[✅ Я оплатил]
[📱 Открыть заявку]
```

### Статус: done
```
⏳ Заявка #abc123

📊 Статус: Оплачена, в обработке

💸 Отдаёте: 100 USDT
💰 Получаете: 50 TON

📬 Адрес: UQxxx...xxx
🌐 Сеть: TON

Заявка создана: 02.12.2025, 19:56:00

[📱 Открыть заявку]
```

### Статус: payed
```
✅ Заявка #abc123

📊 Статус: Выполнена

💸 Отдаёте: 100 USDT
💰 Получаете: 50 TON

📬 Адрес: UQxxx...xxx
🌐 Сеть: TON

Заявка создана: 02.12.2025, 19:56:00

[📱 Открыть заявку]
```

## Настройка Webhook

### 1. Установить webhook
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### 2. Проверить webhook
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 3. Удалить webhook (для тестирования)
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

## База данных Firebase

### Структура транзакции
```json
{
  "transactions": {
    "-NxXxXxXxXxXx": {
      "sell": "usdt",
      "buy": "ton",
      "countSell": 100,
      "countBuy": 50,
      "address": "UQxxx...",
      "telegram": "username",
      "status": "created",
      "telegramMessageId": 123,
      "telegramChatId": 456789,
      "id": 1234567890
    }
  }
}
```

### Структура пользователей Telegram
```json
{
  "telegramUsers": {
    "123456789": {
      "id": 123456789,
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "language_code": "ru",
      "last_interaction": 1701534960000
    }
  }
}
```

## Переменные окружения

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_bot_username
SITE_URL=https://your-domain.com
```

## Логи

- `[Telegram Webhook]` - события webhook
- `[Telegram] Chat ID not found` - пользователь не найден
- `[Telegram] Message not found` - сообщение удалено, отправляем новое

## Особенности

1. **Одно сообщение на заявку** - используется `editMessageText` вместо отправки новых сообщений

2. **Отложенная отправка** - если пользователь еще не взаимодействовал с ботом, уведомление не отправляется

3. **Синхронизация состояния** - статус в Mini App и в сообщении всегда совпадают

4. **Кнопка "Я оплатил"** - обновляет статус в Firebase через webhook, что триггерит обновление в Mini App

5. **Graceful degradation** - если отправка не удалась, приложение продолжает работать

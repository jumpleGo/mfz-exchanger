export default defineEventHandler(async (event) => {
  try {
    const update = await readBody(event)
    const config = useRuntimeConfig()
    const botToken = config.TELEGRAM_BOT_TOKEN

    console.log('[Telegram Webhook] Received update:', JSON.stringify(update))

    // Обработка callback query от inline кнопок
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, botToken)
      return { ok: true }
    }

    // Обработка сообщений (для регистрации пользователя)
    if (update.message) {
      await handleMessage(update.message)
      return { ok: true }
    }

    return { ok: true }
  } catch (error: any) {
    console.error('[Telegram Webhook Error]', error)
    return { ok: false, error: error.message }
  }
})

async function handleCallbackQuery(callbackQuery: any, botToken: string) {
  const { data, message, from } = callbackQuery
  
  console.log('[Telegram Webhook] Callback data:', data)

  // Обработка нажатия кнопки "Я оплатил"
  if (data.startsWith('order_paid_')) {
    const transactionKey = data.replace('order_paid_', '')
    
    // Обновляем статус заявки в Firebase
    const { useServerDatabase } = await import('~/server/utils/firebase')
    const { databaseRef } = useServerDatabase()
    const { child, get, update } = await import('firebase/database')
    
    const transactionRef = child(databaseRef, `transactions/${transactionKey}`)
    const transactionSnapshot = await get(transactionRef)
    
    if (!transactionSnapshot.exists()) {
      await answerCallbackQuery(callbackQuery.id, '❌ Заявка не найдена', botToken)
      return
    }
    
    const transaction = transactionSnapshot.val()
    
    // Проверяем текущий статус
    if (transaction.status === 'done') {
      await answerCallbackQuery(callbackQuery.id, 'ℹ️ Заявка уже отмечена как оплаченная', botToken)
      return
    }
    
    if (transaction.status !== 'created') {
      await answerCallbackQuery(callbackQuery.id, '❌ Невозможно изменить статус этой заявки', botToken)
      return
    }
    
    // Обновляем статус на "done"
    const updates: Record<string, any> = {}
    updates[`transactions/${transactionKey}/status`] = 'done'
    
    await update(databaseRef, updates)
    
    // Обновляем сообщение в чате
    const updatedTransaction = {
      ...transaction,
      status: 'done'
    }
    
    await $fetch('/api/telegram/updateOrderNotification', {
      method: 'POST',
      body: {
        transaction: updatedTransaction,
        transactionKey
      }
    })
    
    await answerCallbackQuery(callbackQuery.id, '✅ Заявка отмечена как оплаченная!', botToken)
  }

  // Обработка нажатия кнопки "Подтвердить" от админа
  if (data.startsWith('admin_confirm_')) {
    const transactionKey = data.replace('admin_confirm_', '')
    
    // Обновляем статус заявки в Firebase на 'payed'
    const { useServerDatabase } = await import('~/server/utils/firebase')
    const { databaseRef } = useServerDatabase()
    const { child, get, update } = await import('firebase/database')
    
    const transactionRef = child(databaseRef, `transactions/${transactionKey}`)
    const transactionSnapshot = await get(transactionRef)
    
    if (!transactionSnapshot.exists()) {
      await answerCallbackQuery(callbackQuery.id, '❌ Заявка не найдена', botToken)
      return
    }
    
    const transaction = transactionSnapshot.val()
    
    // Обновляем статус на "payed"
    const updates: Record<string, any> = {}
    updates[`transactions/${transactionKey}/status`] = 'payed'
    
    await update(databaseRef, updates)
    
    // Обновляем сообщение в админском чате, убирая кнопку
    const { chat_id, message_id } = message
    
    const currentText = message.text
    const updatedText = currentText + '\n\n✅ <b>Подтверждено</b> <i>' + new Date().toLocaleString('ru-RU') + '</i>'
    
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat_id,
        message_id: message_id,
        text: updatedText,
        parse_mode: 'HTML'
      })
    })
    
    // Обновляем сообщение пользователя о завершении заявки
    const updatedTransaction = {
      ...transaction,
      status: 'payed'
    }
    
    await $fetch('/api/telegram/updateOrderNotification', {
      method: 'POST',
      body: {
        transaction: updatedTransaction,
        transactionKey
      }
    })
    
    await answerCallbackQuery(callbackQuery.id, '✅ Заявка подтверждена!', botToken)
  }
}

async function handleMessage(message: any) {
  const { from, text } = message
  
  // Сохраняем информацию о пользователе для future use
  if (from) {
    const { useServerDatabase } = await import('~/server/utils/firebase')
    const { databaseRef } = useServerDatabase()
    const { update } = await import('firebase/database')
    
    const userData = {
      id: from.id,
      username: from.username,
      first_name: from.first_name,
      last_name: from.last_name,
      language_code: from.language_code,
      last_interaction: Date.now()
    }
    
    const updates: Record<string, any> = {}
    updates[`exchanger_bot_users/${from.id}`] = userData
    
    await update(databaseRef, updates)
    
    console.log('[Telegram Webhook] User registered to exchanger_bot_users:', from.username)
  }
}

async function answerCallbackQuery(callbackQueryId: string, text: string, botToken: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: false
    })
  })
}

import type { IActiveTransaction } from '~/stores/exchangerTypes'

export default defineEventHandler(async (event) => {
  try {
    const { transaction, transactionKey } = await readBody<{ transaction: IActiveTransaction, transactionKey: string }>(event)
    const config = useRuntimeConfig()
    const botToken = config.TELEGRAM_BOT_TOKEN
    const siteUrl = config.public.SITE_URL

    if (!botToken) {
      throw createError({
        statusCode: 500,
        message: 'TELEGRAM_BOT_TOKEN not configured'
      })
    }

    if (!transaction.telegramMessageId || !transaction.telegramChatId) {
      // Если нет messageId, отправляем новое сообщение
      console.log('[Telegram] No messageId, sending new notification')
      const sendResponse = await $fetch('/api/telegram/sendOrderNotification', {
        method: 'POST',
        body: { transaction, transactionKey }
      })
      return sendResponse
    }

    // Формируем обновленный текст сообщения
    const statusEmoji = getStatusEmoji(transaction.status)
    const message = formatOrderMessage(transaction, transactionKey, statusEmoji)
    
    // Формируем обновленные inline кнопки
    const keyboard = getKeyboard(transaction, transactionKey, siteUrl)

    // Обновляем сообщение
    const response = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: transaction.telegramChatId,
        message_id: transaction.telegramMessageId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    })

    const data = await response.json()

    if (!data.ok) {
      // Если сообщение не найдено, отправляем новое
      if (data.description?.includes('message to edit not found')) {
        console.log('[Telegram] Message not found, sending new notification')
        const sendResponse = await $fetch('/api/telegram/sendOrderNotification', {
          method: 'POST',
          body: { transaction, transactionKey }
        })
        return sendResponse
      }
      
      throw createError({
        statusCode: 500,
        message: `Telegram API error: ${data.description}`
      })
    }

    // Отправляем уведомление в админский чат при статусе 'done'
    if (transaction.status === 'done') {
      await sendAdminNotification(transaction, transactionKey, botToken, config)
    }

    return {
      success: true,
      messageId: transaction.telegramMessageId,
      chatId: transaction.telegramChatId,
      updated: true
    }
  } catch (error: any) {
    console.error('[Telegram Update Order Notification Error]', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update order notification'
    })
  }
})

function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    'created': '🆕',
    'done': '⏳',
    'payed': '✅',
    'rejected': '❌',
    'timeout': '⏱️'
  }
  return emojis[status] || '📋'
}

function formatOrderMessage(transaction: IActiveTransaction, key: string, statusEmoji: string): string {
  const statusText = getStatusText(transaction.status)
  
  return `${statusEmoji} <b>Заявка #${key.slice(-6)}</b>

📊 <b>Статус:</b> ${statusText}

💸 <b>Отдаёте:</b> ${transaction.countSell} ${transaction.sell.toUpperCase()}
💰 <b>Получаете:</b> ${transaction.countBuy} ${transaction.buy.toUpperCase()}

${transaction.address ? `📬 <b>Адрес:</b> <code>${transaction.address}</code>` : ''}
${transaction.net ? `🌐 <b>Сеть:</b> ${transaction.net}` : ''}
${transaction.memo ? `📝 <b>Memo:</b> <code>${transaction.memo}</code>` : ''}

<i>Заявка создана: ${new Date(transaction.id).toLocaleString('ru-RU')}</i>`
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'created': 'Ожидает оплаты',
    'done': 'Оплачена, в обработке',
    'payed': 'Выполнена',
    'rejected': 'Отклонена',
    'timeout': 'Истекло время'
  }
  return texts[status] || status
}

function getKeyboard(transaction: IActiveTransaction, key: string, siteUrl: string) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || ''
  
  if (transaction.status === 'created') {
    return {
      inline_keyboard: [
        [
          {
            text: '✅ Я оплатил',
            callback_data: `order_paid_${key}`
          }
        ],
        [
          {
            text: '📱 Открыть заявку',
            web_app: { url: siteUrl }
          }
        ]
      ]
    }
  } else if (transaction.status === 'done') {
    return {
      inline_keyboard: [
        [
          {
            text: '📱 Открыть заявку',
            web_app: { url: siteUrl }
          }
        ]
      ]
    }
  } else {
    return {
      inline_keyboard: [
        [
          {
            text: '📱 Открыть заявку',
            web_app: { url: siteUrl }
          }
        ]
      ]
    }
  }
}

async function sendAdminNotification(transaction: IActiveTransaction, key: string, botToken: string, config: any) {
  const adminChatId = config.TELEGRAM_ADMIN_CHAT_ID
  
  if (!adminChatId) {
    console.log('[Telegram] TELEGRAM_ADMIN_CHAT_ID not configured, skipping admin notification')
    return
  }

  const message = `✅ <b>Заявка оплачена #${key.slice(-6)}</b>

💸 <b>Отдал:</b> ${transaction.countSell} ${transaction.sell.toUpperCase()}
💰 <b>Получил:</b> ${transaction.countBuy} ${transaction.buy.toUpperCase()}

${transaction.address ? `📬 <b>Адрес:</b> <code>${transaction.address}</code>` : ''}
${transaction.net ? `🌐 <b>Сеть:</b> ${transaction.net}` : ''}
${transaction.memo ? `📝 <b>Memo:</b> <code>${transaction.memo}</code>` : ''}
${transaction.telegram ? `👤 <b>Telegram:</b> @${transaction.telegram}` : ''}

<i>Заявка создана: ${new Date(transaction.id).toLocaleString('ru-RU')}</i>
<i>оплачена: ${new Date().toLocaleString('ru-RU')}</i>`

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Подтвердить',
                callback_data: `admin_confirm_${key}`
              }
            ]
          ]
        }
      })
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('[Telegram] Failed to send admin notification:', data.description)
    } else {
      console.log('[Telegram] Admin notification sent successfully')
    }
  } catch (error) {
    console.error('[Telegram] Error sending admin notification:', error)
  }
}

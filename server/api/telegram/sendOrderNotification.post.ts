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

    if (!transaction?.telegram) {
      throw createError({
        statusCode: 400,
        message: 'Telegram username is required'
      })
    }

    const username = transaction.telegram.startsWith('@') 
      ? transaction.telegram.slice(1) 
      : transaction.telegram

    // Получаем chat_id пользователя по username
    let chatId: number | null = null
    
    // Формируем текст сообщения
    const statusEmoji = getStatusEmoji(transaction.status)
    const message = formatOrderMessage(transaction, transactionKey, statusEmoji)
    
    // Формируем inline кнопки
    const keyboard = getKeyboard(transaction, transactionKey, siteUrl)

    // Если есть сохраненный chatId, используем его
    if (transaction.telegramChatId) {
      chatId = transaction.telegramChatId
    } else {
      // Пытаемся получить chatId из БД по username
      // (предполагается что пользователь ранее взаимодействовал с ботом)
      const { useServerDatabase } = await import('~/server/utils/firebase')
      const { databaseRef } = useServerDatabase()
      const { child, get } = await import('firebase/database')
      
      const usersSnapshot = await get(child(databaseRef, 'exchanger_bot_users/'))
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val()
        const userEntry = Object.entries(users).find(
          ([_, data]: [string, any]) => data.username === username
        )
        if (userEntry) {
          chatId = Number(userEntry[0])
        }
      }
    }

    if (!chatId) {
      // Если chatId не найден, возвращаем успех без отправки
      // Сообщение будет отправлено когда пользователь откроет mini app
      console.log(`[Telegram] Chat ID not found for @${username}, skipping notification`)
      return {
        success: true,
        skipped: true,
        reason: 'chat_id_not_found'
      }
    }

    // Отправляем сообщение
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    })

    const data = await response.json()

    if (!data.ok) {
      throw createError({
        statusCode: 500,
        message: `Telegram API error: ${data.description}`
      })
    }

    return {
      success: true,
      messageId: data.result.message_id,
      chatId: chatId
    }
  } catch (error: any) {
    console.error('[Telegram Send Order Notification Error]', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send order notification'
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
  const botUsername = process.env.NUXT_TELEGRAM_BOT_USERNAME || ''
  
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

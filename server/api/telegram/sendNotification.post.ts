export default defineEventHandler(async (event) => {
  try {
    const { telegramId, message } = await readBody(event)
    const config = useRuntimeConfig()
    const botToken = config.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      throw createError({
        statusCode: 500,
        message: 'TELEGRAM_BOT_TOKEN not configured'
      })
    }

    if (!telegramId || !message) {
      throw createError({
        statusCode: 400,
        message: 'telegramId and message are required'
      })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML'
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
      messageId: data.result.message_id
    }
  } catch (error: any) {
    console.error('[Telegram Send Notification Error]', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send notification'
    })
  }
})

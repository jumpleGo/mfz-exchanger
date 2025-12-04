export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const botToken = config.TELEGRAM_BOT_TOKEN
  const siteUrl = config.public.SITE_URL

  if (!botToken || !siteUrl) {
    console.warn('⚠️ Telegram webhook не настроен: отсутствуют TELEGRAM_BOT_TOKEN или SITE_URL')
    return
  }

  // Проверяем, что это production и URL использует HTTPS
  if (process.env.NODE_ENV === 'production' && !siteUrl.startsWith('https://')) {
    console.error('❌ Telegram webhook требует HTTPS URL в production')
    return
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`

  try {
    // Проверяем текущий статус webhook
    const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
    const infoData = await infoResponse.json()

    if (infoData.ok && infoData.result.url === webhookUrl) {
      console.log('✅ Telegram webhook уже настроен:', webhookUrl)
      return
    }

    // Устанавливаем webhook
    console.log('🔄 Настройка Telegram webhook:', webhookUrl)
    const setResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    })

    const setData = await setResponse.json()

    if (setData.ok) {
      console.log('✅ Telegram webhook успешно настроен:', webhookUrl)
    } else {
      console.error('❌ Ошибка настройки Telegram webhook:', setData)
    }
  } catch (error) {
    console.error('❌ Ошибка при настройке Telegram webhook:', error)
  }
})

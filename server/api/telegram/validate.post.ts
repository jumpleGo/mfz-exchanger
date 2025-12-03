import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const { initData } = await readBody(event)
    const config = useRuntimeConfig()
    const botToken = config.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      throw createError({
        statusCode: 500,
        message: 'TELEGRAM_BOT_TOKEN not configured'
      })
    }

    if (!initData) {
      throw createError({
        statusCode: 400,
        message: 'initData is required'
      })
    }

    // Парсим initData
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')

    if (!hash) {
      throw createError({
        statusCode: 400,
        message: 'hash is missing in initData'
      })
    }

    // Создаем строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Вычисляем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    // Вычисляем хеш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    // Проверяем хеш
    const isValid = calculatedHash === hash

    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid initData signature'
      })
    }

    // Парсим данные пользователя
    const userParam = urlParams.get('user')
    const user = userParam ? JSON.parse(userParam) : null

    return {
      valid: true,
      user,
      authDate: urlParams.get('auth_date')
    }
  } catch (error: any) {
    console.error('[Telegram Validate Error]', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Validation failed'
    })
  }
})

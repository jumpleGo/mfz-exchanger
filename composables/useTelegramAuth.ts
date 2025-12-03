export const useTelegramAuth = () => {
  const { telegramWebApp, isTelegramBrowser } = useTelegramWebApp()
  const telegramUser = useState<any>('telegramUser', () => null)
  const isValidated = useState<boolean>('telegramValidated', () => false)

  /**
   * Валидирует initData через server API
   */
  const validateTelegramData = async () => {
    if (!telegramWebApp.value?.initData) {
      console.log('[Telegram Auth] No initData available')
      return false
    }

    try {
      const response = await $fetch('/api/telegram/validate', {
        method: 'POST',
        body: {
          initData: telegramWebApp.value.initData
        }
      })

      if (response.valid && response.user) {
        telegramUser.value = response.user
        isValidated.value = true
        console.log('[Telegram Auth] User validated:', response.user)
        return true
      }

      return false
    } catch (error) {
      console.error('[Telegram Auth] Validation failed:', error)
      return false
    }
  }

  /**
   * Отправляет уведомление пользователю через Telegram Bot
   */
  const sendNotification = async (message: string) => {
    if (!telegramUser.value?.id) {
      console.error('[Telegram Auth] No telegram user to send notification')
      return false
    }

    try {
      const response = await $fetch('/api/telegram/sendNotification', {
        method: 'POST',
        body: {
          telegramId: telegramUser.value.id,
          message
        }
      })

      console.log('[Telegram Auth] Notification sent:', response)
      return true
    } catch (error) {
      console.error('[Telegram Auth] Failed to send notification:', error)
      return false
    }
  }

  /**
   * Получает данные пользователя Telegram
   */
  const getTelegramUserData = () => {
    if (telegramUser.value) {
      return telegramUser.value
    }

    if (telegramWebApp.value?.initDataUnsafe?.user) {
      return telegramWebApp.value.initDataUnsafe.user
    }

    return null
  }

  return {
    telegramUser,
    isValidated,
    isTelegramBrowser,
    validateTelegramData,
    sendNotification,
    getTelegramUserData,
  }
}

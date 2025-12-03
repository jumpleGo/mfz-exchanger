export default defineNuxtPlugin(async () => {
  const { waitForTelegram, initTelegramWebApp, isTelegramBrowser, telegramWebApp } = useTelegramWebApp()

  // Ждем загрузки Telegram SDK
  await waitForTelegram()

  if (isTelegramBrowser.value && window.Telegram?.WebApp) {
    console.log('[Telegram Plugin] Initializing Telegram WebApp')
    initTelegramWebApp()

    // Сохраняем пользователя в БД для возможности отправки уведомлений
    const user = telegramWebApp.value?.initDataUnsafe?.user
    if (user?.id) {
      try {
        await $fetch('/api/telegram/saveUser', {
          method: 'POST',
          body: { telegramUser: user }
        })
        console.log('[Telegram Plugin] User saved to database')
      } catch (error) {
        console.error('[Telegram Plugin] Failed to save user:', error)
      }
    }
  } else {
    console.log('[Telegram Plugin] Not a Telegram browser or WebApp not available')
  }
})

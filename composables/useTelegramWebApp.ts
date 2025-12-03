import type { TelegramWebApp } from '~/types/telegram'

export const useTelegramWebApp = () => {
  const telegramWebApp = useState<TelegramWebApp | null>('telegramWebApp', () => null)
  const isTelegramReady = useState<boolean>('isTelegramReady', () => false)
  const isTelegramBrowser = computed(() => {
    if (process.server) return false
    
    const userAgent = navigator.userAgent || ''
    const hasWebApp = !!window.Telegram?.WebApp
    const hasUrlParam = window.location.search.includes('tgWebAppPlatform')
    
    return userAgent.includes('Telegram') || hasWebApp || hasUrlParam
  })

  const isFullscreen = useState<boolean>('isFullscreen', () => false)

  const initTelegramWebApp = () => {
    if (process.server || !window.Telegram?.WebApp) return

    const webApp = window.Telegram.WebApp
    telegramWebApp.value = webApp

    // Инициализация
    webApp.ready()
    webApp.expand()

    // Определение режима fullscreen
    const screenHeight = window.screen.height
    const viewportHeight = webApp.viewportHeight
    const heightDiff = screenHeight - viewportHeight
    isFullscreen.value = heightDiff < 100

    // Применение темы Telegram
    if (webApp.themeParams) {
      const root = document.documentElement
      Object.entries(webApp.themeParams).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--tg-${key.replace(/_/g, '-')}`, value)
        }
      })
    }

    isTelegramReady.value = true
    console.log('[Telegram WebApp] Initialized', {
      platform: webApp.platform,
      version: webApp.version,
      isFullscreen: isFullscreen.value,
    })
  }

  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      if (process.server) {
        resolve()
        return
      }

      if (window.Telegram?.WebApp) {
        resolve()
        return
      }

      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // Таймаут через 5 секунд
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 5000)
    })
  }

  const showAlert = (message: string) => {
    if (telegramWebApp.value) {
      telegramWebApp.value.showAlert(message)
    }
  }

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (telegramWebApp.value) {
        telegramWebApp.value.showConfirm(message, (confirmed) => {
          resolve(confirmed)
        })
      } else {
        resolve(false)
      }
    })
  }

  const hapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (telegramWebApp.value?.HapticFeedback) {
      telegramWebApp.value.HapticFeedback.impactOccurred(style)
    }
  }

  const openLink = (url: string, tryInstantView = false) => {
    if (telegramWebApp.value) {
      telegramWebApp.value.openLink(url, { try_instant_view: tryInstantView })
    } else {
      window.open(url, '_blank')
    }
  }

  const closeTelegramApp = () => {
    if (telegramWebApp.value) {
      telegramWebApp.value.close()
    }
  }

  return {
    telegramWebApp,
    isTelegramReady,
    isTelegramBrowser,
    isFullscreen,
    initTelegramWebApp,
    waitForTelegram,
    showAlert,
    showConfirm,
    hapticFeedback,
    openLink,
    closeTelegramApp,
  }
}

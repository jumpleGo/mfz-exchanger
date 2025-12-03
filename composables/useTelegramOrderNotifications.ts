import type { IActiveTransaction } from '~/stores/exchangerTypes'

export const useTelegramOrderNotifications = () => {
  /**
   * Отправляет уведомление о создании заявки в Telegram
   * @param transaction - объект транзакции
   * @param transactionKey - ключ транзакции в Firebase
   * @returns объект с messageId и chatId для сохранения в БД
   */
  const sendOrderCreated = async (
    transaction: IActiveTransaction,
    transactionKey: string
  ): Promise<{ messageId?: number; chatId?: number } | null> => {
    try {
      const response = await $fetch('/api/telegram/sendOrderNotification', {
        method: 'POST',
        body: {
          transaction,
          transactionKey
        }
      })

      if (response.success && !response.skipped) {
        return {
          messageId: response.messageId,
          chatId: response.chatId
        }
      }

      return null
    } catch (error) {
      console.error('[Telegram Notifications] Failed to send order created:', error)
      return null
    }
  }

  /**
   * Обновляет сообщение о заявке при изменении статуса
   * @param transaction - объект транзакции с обновленным статусом
   * @param transactionKey - ключ транзакции в Firebase
   */
  const updateOrderStatus = async (
    transaction: IActiveTransaction,
    transactionKey: string
  ): Promise<boolean> => {
    try {
      const response = await $fetch('/api/telegram/updateOrderNotification', {
        method: 'POST',
        body: {
          transaction,
          transactionKey
        }
      })

      return response.success
    } catch (error) {
      console.error('[Telegram Notifications] Failed to update order status:', error)
      return false
    }
  }

  /**
   * Сохраняет chatId пользователя в БД
   * Используется при первом открытии mini app
   */
  const saveTelegramChatId = async (username: string, chatId: number) => {
    const { telegramUser } = useTelegramAuth()
    
    if (!telegramUser.value?.id) {
      console.error('[Telegram Notifications] No telegram user data')
      return false
    }

    try {
      const { useServerDatabase } = await import('~/server/utils/firebase')
      const { databaseRef } = useServerDatabase()
      const { update } = await import('firebase/database')

      const updates: Record<string, any> = {}
      updates[`telegramUsers/${chatId}`] = {
        id: telegramUser.value.id,
        username: username,
        first_name: telegramUser.value.first_name,
        last_name: telegramUser.value.last_name,
        language_code: telegramUser.value.language_code,
        last_interaction: Date.now()
      }

      await update(databaseRef, updates)
      return true
    } catch (error) {
      console.error('[Telegram Notifications] Failed to save chat id:', error)
      return false
    }
  }

  return {
    sendOrderCreated,
    updateOrderStatus,
    saveTelegramChatId
  }
}

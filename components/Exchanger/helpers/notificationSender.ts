import type { IActiveTransaction } from '~/stores/exchangerTypes'

export const sendNotification = async (payload: IActiveTransaction) => {
  try {
    await $fetch('/api/mail/sendNotification', {
      method: 'POST',
      body: {
        transaction: payload
      }
    })
    
    console.log('[Email] Notification sent successfully')
  } catch (error) {
    console.error('[Email] Failed to send notification:', error)
  }
}
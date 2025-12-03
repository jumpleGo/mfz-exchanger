export default defineEventHandler(async (event) => {
  try {
    const { telegramUser } = await readBody(event)

    if (!telegramUser?.id) {
      throw createError({
        statusCode: 400,
        message: 'telegramUser with id is required'
      })
    }

    const { useServerDatabase } = await import('~/server/utils/firebase')
    const { databaseRef } = useServerDatabase()
    const { update } = await import('firebase/database')

    const updates: Record<string, any> = {}
    updates[`exchanger_bot_users/${telegramUser.id}`] = {
      id: telegramUser.id,
      username: telegramUser.username,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      language_code: telegramUser.language_code,
      last_interaction: Date.now()
    }

    await update(databaseRef, updates)

    console.log('[Telegram] User saved to exchanger_bot_users:', telegramUser.username || telegramUser.id)

    return {
      success: true,
      userId: telegramUser.id
    }
  } catch (error: any) {
    console.error('[Telegram Save User Error]', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to save telegram user'
    })
  }
})

import { useServerDatabase } from '~/server/utils/firebase'
import { child, get } from 'firebase/database'

export default defineEventHandler(async (event) => {
  const { databaseRef } = useServerDatabase()
  
  try {
    const exchangePairsSnapshot = await get(child(databaseRef, 'exchangePairs/'))
    
    if (!exchangePairsSnapshot.exists()) {
      return {
        COINS: [],
        VALUTE: [],
        OTHERS: []
      }
    }
    
    const data = exchangePairsSnapshot.val()
    
    return {
      COINS: data.COINS || [],
      VALUTE: data.VALUTE || [],
      OTHERS: data.OTHERS || []
    }
  } catch (error) {
    console.error('Server error fetching exchange pairs:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch exchange pairs'
    })
  }
})

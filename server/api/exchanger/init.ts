import { useServerDatabase } from '~/server/utils/firebase'
import { CreateSymbolPrice } from '~/api/models/SymbolPrice'
import axios from 'axios'
import { child, get, query, equalTo, orderByChild } from 'firebase/database'

export default defineEventHandler(async (event) => {
  const { databaseRef } = useServerDatabase()
  
  try {
    // Получаем настройки обменника напрямую через Firebase
    const exchangerSettingsSnapshot = await get(child(databaseRef, 'exchangerSettings/'))
    const vatsSnapshot = await get(child(databaseRef, 'vatsByTokens/'))
    const minmaxLimitSnapshot = await get(child(databaseRef, 'minmaxLimit/'))
    const modalsSnapshot = await get(child(databaseRef, 'globalModals/'))
    
    const exchangerSettings = exchangerSettingsSnapshot.exists() ? exchangerSettingsSnapshot.val() : null
    const vats = vatsSnapshot.exists() ? vatsSnapshot.val() : null
    const minmaxLimit = minmaxLimitSnapshot.exists() ? minmaxLimitSnapshot.val() : null
    const modals = modalsSnapshot.exists() ? modalsSnapshot.val() : null

    // Если сайт отключен, возвращаем только базовые данные
    if (!exchangerSettings?.isSiteEnable) {
      return {
        exchangerSettings,
        vats,
        minmaxLimit,
        modals,
        isSiteDisabled: true
      }
    }

    let pricesList = []
    let priceUsd = 0
    let hasError = false
    let showHighLoad = false

    // Получаем цены с OKX
    try {
      const { data: okxResponse } = await axios.get('https://www.okx.com/api/v5/market/tickers?instType=SWAP')
      pricesList = okxResponse.data
        .filter((item: any) => ['TON-USDT-SWAP', 'NOT-USDT-SWAP'].includes(item.instId))
        .map((item: any) => CreateSymbolPrice.createSymbolPriceByOKX(item))
    } catch (error) {
      console.error('Error fetching OKX prices:', error)
      hasError = true
    }

    // Получаем курс USD/RUB
    try {
      const { data: rateResponse } = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.NUXT_CRYPTO_CURRENCY_TOKEN}&currencies=RUB`)
      priceUsd = rateResponse.data.RUB.value
      if (priceUsd === 0) {
        hasError = true
      }
    } catch (error) {
      console.error('Error fetching USD price:', error)
      hasError = true
    }

    // Проверяем нагрузку на систему
    try {
      const transactionsQuery = query(
        child(databaseRef, '/transactions'),
        orderByChild('status'),
        equalTo('done')
      )
      const transactionsSnapshot = await get(transactionsQuery)
      const countActive = transactionsSnapshot.size
      
      if (countActive >= 15 && !hasError) {
        showHighLoad = true
      }
    } catch (error) {
      console.error('Error checking system load:', error)
    }

    return {
      exchangerSettings,
      vats,
      minmaxLimit,
      modals,
      pricesList,
      priceUsd,
      hasError,
      showHighLoad,
      isSiteDisabled: false
    }
  } catch (error) {
    console.error('Server error in exchanger init:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to initialize exchanger data'
    })
  }
})

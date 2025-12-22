import axios from 'axios'

export const getPriceByTickers = async () => {
  return await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.NUXT_CRYPTO_CURRENCY_TOKEN}&currencies=RUB`)
}

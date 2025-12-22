import axios from 'axios'

export const getPriceByTickers = async () => {
  const config = useRuntimeConfig()
  return await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${config.public.cryptoCurrencyToken}&currencies=RUB`)
}

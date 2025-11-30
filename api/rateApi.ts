import axios from 'axios'

export const getPriceByTickers = async () => {
  return await axios.get('https://api.currencyapi.com/v3/latest?apikey=cur_live_34DPnNwfsofhIluKiBRne1uEJAp0K3OzyEtcK0Om&currencies=RUB')
}

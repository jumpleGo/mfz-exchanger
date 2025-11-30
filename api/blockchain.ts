

import axios, { type AxiosResponse } from 'axios'

interface ISymbolPrice {
  symbol: string
  price: number
}

export const getPriceByTickers = async () :Promise<AxiosResponse<ISymbolPrice[]>> => {
  return await axios.get('https://api.blockchain.com/v3/exchange/tickers/USDT-RUB')
}
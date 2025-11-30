import axios, { type AxiosResponse } from 'axios'
import type { ISymbolPrice } from '~/api/types'

export const getPriceByTickers = async (symbols?: string[]) :Promise<AxiosResponse<ISymbolPrice[]>> => {
  const defaultSymbols = ["BTCUSDT", "ATOMUSDT", "OPUSDT", "AXSUSDT", "BNBUSDT", "ETHUSDT", "ETCUSDT"]
  const tickerSymbols = symbols || defaultSymbols
  const symbolsParam = encodeURIComponent(JSON.stringify(tickerSymbols))
  return await axios.get(`https://api4.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`)
}
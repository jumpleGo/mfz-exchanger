export type CryptoKeys = 'btc' | 'ton' | 'not' | 'usdt'
export type ValuteKeys = 'ozon' | 'sber' | 'yandex' | 'tbank' | 'sbp'
export type Others = 'stars'
export type Selected = {
  title: string,
  enabled: boolean,
  key: CryptoKeys | Others | ValuteKeys,
  image: string,
  type: 'valute' | 'crypto' | 'telegram',
  options: ['sell', 'buy']
}
export type Status =  'created' | 'rejected' | 'done' | 'timeout' | 'payed'
export type IActiveTransaction = {
  id: number,
  sell: CryptoKeys | ValuteKeys,
  buy: CryptoKeys | ValuteKeys | Others,
  countSell: number,
  countBuy: number,
  address: string,
  memo: string,
  net: string,
  factor: number,
  telegram: string,
  status: Status,
  expirationTime?: string,
  promocode?: string,
  telegramMessageId?: number,
  telegramChatId?: number,
  freeze?: boolean
}

export interface IAdmin {key: string, privileges: string}

export interface INotificationObject {
  message?: string,
  image?: string,
  title?: string,
}
export type IExchangerSettings = {
  adminHashes: IAdmin[],
  maxLimit: number,
  minLimit: number,
  starsRate: number,
  baseNotificationMessage: string,
  showOffer: boolean,
  isSiteEnable: boolean
  isNotificationEnable: boolean
  disableSiteReason: string
  notificationObject: INotificationObject
  highloadImage: string

}

export type IActiveTransactionWithKey = IActiveTransaction & {key?: string}


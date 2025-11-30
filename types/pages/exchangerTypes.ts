export interface IPrices {
  ton: number,
  not: number,
  usdt: number,
}
export interface IVatsByTokens {
  ton: IVat,
  not: IVat,
  usdt: IVat
}

export interface IVat {
  VAT_BIG: number,
  VAT_SMALL: number
}
export interface IVats {
  VAT_PLUS_BIG: number,
  VAT_PLUS_SMALL: number,
  VAT_MINUS_BIG: number,
  VAT_MINUS_SMALL: number,
}
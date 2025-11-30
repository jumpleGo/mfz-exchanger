export class CreateSymbolPrice {
  static createSymbolPriceByOKX (data: Record<string, string | number>) {
    return {
      symbol: data.instId.split('-')[0]+'USDT',
      price: +data.last
    }
  }
}
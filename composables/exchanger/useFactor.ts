import { storeToRefs } from "pinia";
import type { IModel } from "~/components/Exchanger/types";

export const useFactor = (model: IModel) => {
  // В тестах используем глобальный мок, в продакшене - реальный store
  const store = useExchangerStore();

  const { vats, isValuteForSell, selectedSell, selectedBuy, priceUsd, pricesList } =
    storeToRefs(store);
  const defaultValue = {
    VAT_BIG: 1,
    VAT_SMALL: 1,
  };
  const factor = ref<number>(1);

  /**
   * Рассчитывает factor на основе суммы
   * @param calculateAmount - сумма в рублях для определения порога комиссии
   * @param useBasePrice - если true, использовать базовую цену без комиссии для расчета порога
   */
  const calculateFactor = (calculateAmount: number, useBasePrice: boolean = false) => {
    if (isValuteForSell.value) {
      const { VAT_BIG = 1, VAT_SMALL = 1 } =
        vats.value?.[selectedBuy.value?.key] || defaultValue;
      factor.value =
        1 + (calculateAmount < 10000 ? VAT_BIG / 100 : VAT_SMALL / 100);
    } else {
      const { VAT_BIG, VAT_SMALL } =
        vats.value?.[selectedSell.value?.key] || defaultValue;
      
      // Для корректного определения порога используем базовую цену
      let thresholdAmount = calculateAmount;
      
      if (useBasePrice && model.count > 0 && selectedSell.value?.key) {
        // Получаем базовую цену криптовалюты
        const cryptoKey = selectedSell.value.key.toUpperCase();
        const usdt = priceUsd.value || 0;
        let basePrice = 0;
        
        if (cryptoKey === 'USDT') {
          basePrice = usdt;
        } else if (cryptoKey === 'BTC') {
          basePrice = (pricesList.value?.find((item) => item.symbol === "BTCUSDT")?.price || 0) * usdt;
        } else if (cryptoKey === 'TON') {
          basePrice = (pricesList.value?.find((item) => item.symbol === "TONUSDT")?.price || 0) * usdt;
        } else if (cryptoKey === 'NOT') {
          basePrice = (pricesList.value?.find((item) => item.symbol === "NOTUSDT")?.price || 0) * usdt;
        }
        
        // Рассчитываем порог по базовой цене без учета комиссии
        thresholdAmount = model.count * basePrice;
      }
      
      factor.value =
        1 - (thresholdAmount < 10000 ? VAT_BIG / 100 : VAT_SMALL / 100);
    }
  };
  return {
    factor,
    calculateFactor,
  };
};

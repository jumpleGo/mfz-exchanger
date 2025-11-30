import { storeToRefs } from "pinia";
import type { IModel } from "~/components/Exchanger/types";

export const useFactor = (model: IModel) => {
  // В тестах используем глобальный мок, в продакшене - реальный store
  const store = useExchangerStore();

  const { vats, isValuteForSell, selectedSell, selectedBuy } =
    storeToRefs(store);
  const defaultValue = {
    VAT_BIG: 1,
    VAT_SMALL: 1,
  };
  const factor = ref<number>(1);

  const calculateFactor = (calculateAmount: number) => {
    if (isValuteForSell.value) {
      const { VAT_BIG = 1, VAT_SMALL = 1 } =
        vats.value?.[selectedBuy.value?.key] || defaultValue;
      factor.value =
        1 + (calculateAmount < 10000 ? VAT_BIG / 100 : VAT_SMALL / 100);
    } else {
      const { VAT_BIG, VAT_SMALL } =
        vats.value?.[selectedSell.value?.key] || defaultValue;
      factor.value =
        1 - (calculateAmount < 10000 ? VAT_BIG / 100 : VAT_SMALL / 100);
    }
  };
  return {
    factor,
    calculateFactor,
  };
};

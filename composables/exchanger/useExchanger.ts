import { computed } from "vue";
import type { IOption } from "~/components/App/types";

import {
  countMaskaOptionsNotStartsFromZero,
  countMaskaOptionsStartsFromZero,
  usdtNet,
} from "~/components/Exchanger/consts";
import type { IPrices } from "~/types/pages/exchangerTypes";
import type { IModel } from "~/components/Exchanger/types";

export const useExchangerSettings = (model: IModel) => {
  const {
    selectedBuy,
    activeTransaction,
    isZeroAmountStarts,
    isCryptoForSell,
    isValuteForSell,
    selectedSell,
    priceUsd,
    pricesList,
    isUSDTBuy,
  } = storeToRefs(useExchangerStore());

  // Настройки маски ввода
  const maskaOptions = computed(() => {
    return isZeroAmountStarts.value
      ? countMaskaOptionsStartsFromZero
      : countMaskaOptionsNotStartsFromZero;
  });

  // Модель для выбора сети
  const netModel = computed({
    get: () =>
      usdtNet.find((item) => item.key === model.net) || { name: "", key: "" },
    set: (item: IOption) => (model.net = item.key),
  });

  // Placeholder для адреса
  const placeholderAddress = computed(() =>
    selectedBuy.value?.type === "crypto"
      ? "Адрес кошелька"
      : "Телефон или номер карты",
  );

  const calculateItem = computed(() => {
    return selectedBuy.value?.type === "valute"
      ? "RUB"
      : selectedBuy.value?.key?.toUpperCase();
  });

  const isMemoShow = computed(() => {
    if (!selectedBuy.value?.key) return false;
    return (
      ["ton", "not"].includes(selectedBuy.value?.key) ||
      (isUSDTBuy.value && netModel.value.key === "ton")
    );
  });
  const isNetShow = computed(() => {
    if (!selectedBuy.value?.key) return false;
    return selectedBuy.value?.key === "usdt";
  });

  const sumLabel = computed(() => {
    if (isCryptoForSell.value || isValuteForSell.value) {
      return isCryptoForSell.value
        ? `Сумма (${selectedSell.value.key?.toUpperCase()})`
        : `Сумма (RUB)`;
    }

    return "Сумма";
  });

  const prices = computed<IPrices>(() => {
    const usdt = priceUsd.value || 0;
    const btc =
      (pricesList.value.find((item) => item.symbol === "BTCUSDT")?.price || 0) *
      usdt;
    const ton =
      (pricesList.value.find((item) => item.symbol === "TONUSDT")?.price || 0) *
      usdt;
    const not =
      (pricesList.value.find((item) => item.symbol === "NOTUSDT")?.price || 0) *
      usdt;
    return {
      not,
      ton,
      usdt,
      btc,
    };
  });

  return {
    maskaOptions,
    netModel,
    placeholderAddress,
    calculateItem,
    isMemoShow,
    sumLabel,
    isNetShow,
    prices,
  };
};

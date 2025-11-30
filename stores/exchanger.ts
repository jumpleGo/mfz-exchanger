import { computed, ref } from "vue";
import type {
  IActiveTransactionWithKey,
  IExchangerSettings,
  Selected,
  Status,
} from "~/stores/exchangerTypes";
import type { IVatsByTokens } from "~/types/pages/exchangerTypes";
import type { ISymbolPrice } from "~/api/types";

export const useExchangerStore = defineStore("exchanger", () => {
  const coins = ref<Selected[]>([]);
  const valutes = ref<Selected[]>([]);
  const others = ref<Selected[]>([]);
  const activeTransaction = ref<IActiveTransactionWithKey | null>(null);
  const time = ref();
  const selectedSell = ref<Partial<Selected>>({});
  const selectedBuy = ref<Partial<Selected>>({});
  const vats = ref<IVatsByTokens>();
  const vatsInitial = ref<IVatsByTokens>();
  const minmaxLimit = ref();
  const pricesList = ref<ISymbolPrice[]>([]);
  const priceUsd = ref<number>(0);

  const clearSelected = () => {
    selectedSell.value = {};
    selectedBuy.value = {};
  };

  const updateStatus = (status: Status) =>
    (activeTransaction.value!.status = status);

  const exchangerSettings = ref<IExchangerSettings>({
    starsRate: 0,
    adminHashes: [],
    maxLimit: 0,
    minLimit: 0,
    notificationType: "",
    showOffer: false,
    isSiteEnable: true,
    disableSiteReason: "",
    notificationObject: {},
    highloadImage: "",
    isNotificationEnable: false,
  });

  const enabledCoins = computed<Selected[]>(() => {
    return Object.values(coins.value).filter((item) => item.enabled);
  });

  const enabledOthers = computed<Selected[]>(() => {
    return Object.values(others.value).filter((item) => item.enabled);
  });

  const enabledValutes = computed<Selected[]>(() => {
    return Object.values(valutes.value).filter((item) => item.enabled);
  });

  const valutesForSell = computed<Selected[]>(() => {
    return (
      enabledValutes.value?.filter((item) => item.options?.includes("sell")) ||
      []
    );
  });
  const valutesForBuy = computed<Selected[]>(() => {
    return (
      enabledValutes.value?.filter((item) => item.options?.includes("buy")) ||
      []
    );
  });

  const coinsForSell = computed<Selected[]>(() => {
    return (
      enabledCoins.value?.filter((item) => item.options?.includes("sell")) || []
    );
  });
  const coinsForBuy = computed<Selected[]>(() => {
    return (
      enabledCoins.value?.filter((item) => item.options?.includes("buy")) || []
    );
  });

  const isUSDTSell = computed(() => selectedSell.value.key === "usdt");
  const isSBPSell = computed(() => selectedSell.value.key === "sbp");
  const isUSDTBuy = computed(() => selectedBuy.value.key === "usdt");
  const isBTCBuy = computed(() => selectedBuy.value.key === "btc");
  const isStarsBuy = computed(() => selectedBuy.value?.key === "stars");

  const isTonForSell = computed(() =>
    ["not", "ton"].includes(selectedSell.value?.key || ""),
  );
  const isTonForBuy = computed(() =>
    ["not", "ton"].includes(selectedBuy.value?.key || ""),
  );

  const isCryptoForSell = computed(() => {
    return (
      selectedSell.value?.key &&
      Object.values(enabledCoins.value)
        ?.map((i: Selected) => i.key)
        .includes(selectedSell.value?.key)
    );
  });
  const isValuteForSell = computed(() => {
    return (
      selectedSell.value?.key &&
      Object.values(enabledValutes.value)
        ?.map((i: Selected) => i.key)
        .includes(selectedSell.value?.key)
    );
  });
  const isCryptoForBuy = computed(() => {
    return (
      selectedBuy.value?.key &&
      Object.values(enabledCoins.value)
        ?.map((i: Selected) => i.key)
        .includes(selectedBuy.value.key)
    );
  });
  const isValuteForBuy = computed(() => {
    return (
      selectedBuy.value?.key &&
      Object.values(enabledValutes.value)
        ?.map((i: Selected) => i.key)
        .includes(selectedBuy.value?.key)
    );
  });

  const isZeroAmountStarts = computed(() => {
    return (
      selectedSell.value?.key &&
      ["btc", "ton"].includes(selectedSell.value?.key)
    );
  });

  const isSelectedBothItem = computed(
    () => selectedBuy.value?.key && selectedSell.value?.key,
  );

  return {
    clearSelected,
    others,
    vats,
    vatsInitial,
    pricesList,
    priceUsd,
    isTonForBuy,
    isTonForSell,
    isStarsBuy,
    exchangerSettings,
    minmaxLimit,
    time,
    valutes,
    coins,
    selectedSell,
    selectedBuy,
    enabledCoins,
    enabledValutes,
    isUSDTSell,
    isSBPSell,
    isCryptoForSell,
    isValuteForSell,
    isSelectedBothItem,
    activeTransaction,
    isValuteForBuy,
    isCryptoForBuy,
    valutesForSell,
    valutesForBuy,
    coinsForSell,
    coinsForBuy,
    updateStatus,
    enabledOthers,
    isUSDTBuy,
    isBTCBuy,
    isZeroAmountStarts,
  };
});

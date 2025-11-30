<template>
  <div>
    <div class="exchanger__block">
      <p class="exchanger__title">отправляете:</p>
      <div class="exchanger__items">
        <p class="exchanger__subtitle">криптовалюта</p>
        <div v-if="coinsForSell.length" class="exchanger__items--list">
          <div
            v-for="(coin, index) in coinsForSell"
            :key="index + 'coin--first'"
            :class="[
              'exchanger__item',
              { active: selectedSell?.key && selectedSell?.key === coin.key },
              { '--disabled': isCryptoForBuy },
            ]"
            @click="selectSell('crypto', coin)"
          >
            <AppImage
              :image="`exchanger-valutes/${coin.key}.png`"
              :preload="{ fetchPriority: 'high' }"
              width="25"
              height="25"
            />
            {{ coin.title }}
          </div>
        </div>
      </div>
      <div class="exchanger__items">
        <p class="exchanger__subtitle">фиат</p>
        <div v-if="valutesForSell.length" class="exchanger__items--list">
          <div
            v-for="(valute, index) in valutesForSell"
            :key="index + 'valute--first'"
            class="exchanger__item"
            :class="[
              'exchanger__item',
              {
                active:
                  selectedSell?.title && selectedSell.title === valute.title,
              },
              { '--disabled': isValuteForBuy },
            ]"
            @click="selectSell('valute', valute)"
          >
            <AppImage
              :image="`exchanger-valutes/${valute.key}.png`"
              :preload="{ fetchPriority: 'high' }"
              width="25"
              height="25"
            />
            {{ valute.title }}
          </div>
        </div>
      </div>
    </div>
    <div class="exchanger__block">
      <p class="exchanger__title">получаете:</p>
      <div class="exchanger__items">
        <p class="exchanger__subtitle">фиат</p>
        <div v-if="valutesForBuy.length" class="exchanger__items--list">
          <div
            v-for="(valute, index) in valutesForBuy"
            :key="index + 'valute--second'"
            class="exchanger__item"
            :class="[
              'exchanger__item',
              { active: selectedBuy?.key && selectedBuy.key === valute.key },
              { '--disabled': isValuteForSell },
            ]"
            @click="selectBuy('valute', valute)"
          >
            <AppImage
              :image="`exchanger-valutes/${valute.key}.png`"
              :preload="{ fetchPriority: 'high' }"
              width="25"
              height="25"
            />
            {{ valute.title }}
          </div>
        </div>
      </div>
      <div class="exchanger__items">
        <p class="exchanger__subtitle">криптовалюта</p>
        <div v-if="coinsForBuy.length" class="exchanger__items--list">
          <div
            v-for="(coin, index) in coinsForBuy"
            :key="index + 'coin--first'"
            :class="[
              'exchanger__item',
              { active: selectedBuy?.key && selectedBuy.key === coin.key },
              { '--disabled': isCryptoForSell },
            ]"
            @click="selectBuy('crypto', coin)"
          >
            <AppImage
              :image="`exchanger-valutes/${coin.key}.png`"
              :preload="{ fetchPriority: 'high' }"
              width="25"
              height="25"
            />
            {{ coin.title }}
          </div>
        </div>
      </div>
      <div class="exchanger__items">
        <p class="exchanger__subtitle">другое</p>
        <div v-if="enabledOthers.length" class="exchanger__items--list">
          <div
            v-for="(coin, index) in enabledOthers"
            :key="index + 'coin--first'"
            :class="[
              'exchanger__item',
              { active: selectedBuy?.key && selectedBuy.key === coin.key },
              { '--disabled': !isTonForSell && !isValuteForSell },
            ]"
            @click="selectBuy('others', coin)"
          >
            <AppImage
              :image="`exchanger-valutes/${coin.key}.png`"
              :preload="{ fetchPriority: 'high' }"
              loading="eager"
              decoding="sync"
            />
            {{ coin.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useExchangerStore } from "~/stores/exchanger";
import { watch } from "vue";
import type { Selected } from "~/stores/exchangerTypes";
import { useGetter } from "~/composables/useGetter";
const {
  coins,
  valutes,
  valutesForSell,
  valutesForBuy,
  coinsForSell,
  coinsForBuy,
  selectedBuy,
  selectedSell,
  enabledOthers,
  isValuteForSell,
  isCryptoForSell,
  isCryptoForBuy,
  isValuteForBuy,
  others,
  isTonForSell,
} = storeToRefs(useExchangerStore());

const { getFromDB } = useGetter();

const { data } = useAsyncData(async () => {
  const { COINS, VALUTE, OTHERS } = await getFromDB("exchangePairs/");

  coins.value = COINS;
  valutes.value = VALUTE;
  others.value = OTHERS;
});

watch(selectedSell, () => {
  if (!Object.keys(selectedSell.value).length) return;
  if (selectedSell.value?.type === selectedBuy.value?.type) {
    selectedBuy.value = {};
  }
});
watch(selectedBuy, () => {
  if (!Object.keys(selectedBuy.value).length) return;
  if (selectedSell.value?.type === selectedBuy.value?.type) {
    selectedBuy.value = {};
  }
});
const selectSell = (type: "crypto" | "valute", item: Selected) => {
  if (type === "crypto") {
    if (isCryptoForBuy.value) return;
    selectedSell.value = item;
  }
  if (type === "valute") {
    if (isValuteForBuy.value) return;
    selectedSell.value = item;
  }
};
const selectBuy = (type: "crypto" | "valute" | "others", item: Selected) => {
  if (type === "crypto") {
    if (isCryptoForSell.value) return;
    selectedBuy.value = item;
  }
  if (type === "valute") {
    if (isValuteForSell.value) return;
    selectedBuy.value = item;
  }
  if (type === "others") {
    if (isTonForSell.value || isValuteForSell.value) {
      selectedBuy.value = item;
    }
    return;
  }
};
</script>

<style lang="scss" scoped>
.exchanger__title {
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 600;
}
.exchanger__subtitle {
  text-transform: uppercase;
  font-size: 14px;
}

.exchanger__block {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 40px;

  &:first-child {
    border-right: 1px solid rgba(128, 128, 128, 0.36);
  }

  @include mobile-all {
    padding: 0 20px;
  }
}
.exchanger__items--list {
  display: flex;
  flex-direction: column;
}
.exchanger__item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  @include mobile {
    font-size: 13px;
  }

  @include mobile-xs {
    padding: 8px 5px;
    font-size: 12px;
  }
  &:hover {
    cursor: pointer;
    border: 1px solid $brand_yellow;
    background: rgba(254, 190, 22, 0.1);
  }
  img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    box-shadow: 0px 0px 9px 3px rgba(0, 0, 0, 0.23);
  }
}
.--disabled {
  position: relative;
  &:hover {
    cursor: not-allowed;
  }
  &::after {
    content: "";
    width: 100%;
    height: 100%;
    background: rgba(222, 217, 210, 0.54);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
  }
}
.active {
  border: 1px solid $brand_yellow;
  background: rgba(254, 190, 22, 0.1);
}
.exchanger__subtitle {
  margin: 10px;
}
</style>

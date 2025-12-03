<template>
  <div class="exchanger__wrapper">
    <ClientOnly>
      <ErrorNotification v-if="showError && !loading" />
      <HighLoadNotification
        v-if="showHightLoad && !loading"
        :image="exchangerSettings.highloadImage"
      />
      <MessageNotification
        v-if="showNotification && !loading"
        :notification="exchangerSettings.notificationObject"
        @close="showNotification = false"
      />
      <DisablePage
        v-if="!exchangerSettings.isSiteEnable && !loading"
        :reason="exchangerSettings.disableSiteReason"
      />
    </ClientOnly>
    <AppLoader v-if="loading" />
    <NotificationBlock
      class="exchanger__notification-block"
      v-if="
        !showError &&
        !loading &&
        exchangerSettings?.baseNotificationMessage &&
        !isLoadingResize &&
        showLeftBlock
      "
      :text="exchangerSettings.baseNotificationMessage"
    />

    <div
      v-if="
        !showError &&
        !loading &&
        !showHightLoad &&
        exchangerSettings.isSiteEnable
      "
      class="exchanger"
    >
      <div v-if="!isLoadingResize" class="exchanger__content">
        <div
          v-if="exchangerSettings.showOffer"
          class="exchanger__content--icon"
          @click="showModal = true"
        >
          🎁
        </div>
        <LeftExchangerBlock
          v-if="showLeftBlock"
          :class="[
            'exchanger__left',
            { '--disabled-block': activeTransaction },
          ]"
        />
        <TransactionBlock
          v-if="activeTransaction"
          class="exchanger__right__payment"
        />
        <RightExchangerBlock
          v-if="showRightBlock"
          class="exchanger__right"
          @back="backToPair"
        />
      </div>
    </div>
  </div>

  <DynamicModal
    v-for="modal in modalsArray"
    :key="modal.config.cookieName"
    v-model="modal.isOpen"
    :thumbnail="modal.config.thumbnail"
    :title="modal.config.title"
    :description="modal.config.description"
    :button-text="modal.config.buttonText"
    :cookie-name="modal.config.cookieName"
  />
</template>

<script lang="ts" setup>
import { shallowRef, onMounted, computed, watch } from "vue";
import RightExchangerBlock from "~/components/Exchanger/RightExchangerBlock.vue";
import LeftExchangerBlock from "~/components/Exchanger/LeftExchangerBlock.vue";
import TransactionBlock from "~/components/Exchanger/TransactionBlock.vue";
import useResponsive from "~/composables/useResponsive";
import NotificationBlock from "~/components/Exchanger/NotificationBlock.vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "~/stores/main";
import DynamicModal from "~/components/App/DynamicModal.vue";
import { useModal } from "~/composables/useModal";
import { useExchangerStore } from "~/stores/exchanger";
import type { ModalConfig } from "~/composables/useModal";
import AppLoader from "../components/App/AppLoader.vue";

const HighLoadNotification = defineAsyncComponent(
  () => import("~/components/Exchanger/HighLoadNotification.vue"),
);
const ErrorNotification = defineAsyncComponent(
  () => import("~/components/Exchanger/ErrorNotification.vue"),
);
const DisablePage = defineAsyncComponent(
  () => import("~/components/Exchanger/DisablePage.vue"),
);
const MessageNotification = defineAsyncComponent(
  () => import("~/components/Exchanger/MessageNotification.vue"),
);

const {
  activeTransaction,
  isSelectedBothItem,
  exchangerSettings,
  vats,
  vatsInitial,
  pricesList,
  priceUsd,
  minmaxLimit,
} = storeToRefs(useExchangerStore());
const hideRightBlock = shallowRef(true);
const { isMobile, isLoadingResize } = useResponsive();
const { showModal } = storeToRefs(useMainStore());

definePageMeta({
  layout: "exchanger",
  middleware: "exchanger",
});

useHead({
  title: 'MFZ Exchanger',
  meta: [
    {
      name: "robots",
      content: "noindex,nofollow",
    },
    {
      name: "description",
      content: "MFZ Exchanger - обменник криптовалют",
    },
  ],
});

const showError = shallowRef(false);
const showNotification = shallowRef(false);
const showHightLoad = shallowRef(false);

const { data, refresh, status } = await useAsyncData('exchanger-init', async () => {
  try {
    const response = await $fetch('/api/exchanger/init');
    
    // Устанавливаем данные из серверного ответа
    exchangerSettings.value = response.exchangerSettings;
    vats.value = response.vats;
    vatsInitial.value = JSON.parse(JSON.stringify(response.vats));
    minmaxLimit.value = response.minmaxLimit;
    
    // Если сайт отключен, останавливаемся
    if (response.isSiteDisabled) {
      return { modals: response.modals };
    }
    
    // Устанавливаем цены и статусы
    pricesList.value = response.pricesList;
    priceUsd.value = response.priceUsd;
    showError.value = response.hasError;
    showHightLoad.value = response.showHighLoad;
    
    // Показываем уведомление если включено
    if (exchangerSettings.value?.isNotificationEnable) {
      showNotification.value = true;
    }
    
    return { modals: response.modals };
  } catch (error) {
    console.error('Failed to initialize exchanger:', error);
    showError.value = true;
    return { modals: [] };
  }
});

// Привязываем loading к status из useAsyncData
const loading = computed(() => status.value === 'pending');

onMounted(() => {
  if (status.value === "error") refresh();
});

const modalsArray = computed(() => {
  return data.value?.modals.map((modal: ModalConfig) => {
    return useModal({
      thumbnail: modal.thumbnail,
      title: modal.title,
      description: modal.description,
      buttonText: modal.buttonText,
      cookieName: modal.cookieName,
      isAutoShow: modal.isAutoShow,
    });
  });
});

const showLeftBlock = computed(() => {
  if (isMobile.value) {
    return !isSelectedBothItem.value ? !activeTransaction.value : false;
  }
  return true;
});
const showRightBlock = computed(() => {
  if (isMobile.value) {
    return isSelectedBothItem.value && !activeTransaction.value;
  } else {
    return !activeTransaction.value;
  }
});

watch(isSelectedBothItem, (value) => {
  if (value) hideRightBlock.value = false;
});

const backToPair = () => {
  useExchangerStore().clearSelected();
};
</script>
<style lang="scss">
@import "./../style/exchanger.scss";
.exchanger__wrapper {
  padding: 15px 0;
  display: flex;
  width: 100%;
  height: calc(100vh - 20px);
  justify-content: center;
  align-items: center;
  position: relative;
  @include mobile-all {
    height: 100%;
  }
}
.exchanger {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1300px;

  @include mobile-all {
    padding: 0 15px;
  }
  &__notification-block {
    top: 0;
    position: absolute;
    z-index: 999;
  }
}
.exchanger__content {
  display: flex;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 100px);
  gap: 100px;
  position: relative;

  @include mobile-all {
    position: relative;
    flex-direction: column;
    align-items: center;
    margin: unset;
    height: 100%;
    gap: unset;
  }

  &--icon {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 10;
    font-size: 32px;
    background: rgba(254, 190, 22, 0.1);
    padding: 5px 10px;
    border: 1px solid #f1b000;
    border-radius: 10px;
    animation: boxShadowAnim 5s infinite;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

@keyframes boxShadowAnim {
  50% {
    box-shadow: 0 0 30px $brand_yellow;
  }
}

.investment__offer {
  max-width: 1000px;
  background: white;
  overflow-y: scroll;
  height: 70vh;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>

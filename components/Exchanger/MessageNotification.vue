<template>
  <div class="mfz_notification">
    <div class="mfz_notification__notification">
      <nuxt-img
        v-if="notification.image"
        width="80px"
        height="80px"
        :src="notification.image"
        class="mfz_notification__image"
      />
      <span
        v-if="notification.title"
        class="mfz_notification__notification_text"
      >
        {{ notification.title }}
      </span>
      <span class="mfz_notification__notification_second_text">
        {{ notification.message }}
      </span>
      <AppButton
        size="xs"
        title="понятно"
        @click="emit('close')"
        fluid
        class="mfz_notification__notification_button"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import AppButton from "~/components/App/AppButton.vue";
import type { INotificationObject } from "~/stores/exchangerTypes";
defineProps<{
  notification: INotificationObject;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>
<style lang="scss" scoped>
.mfz_notification {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  &__notification {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-width: 400px;
    width: 100%;
    height: fit-content;
    padding: 30px;
    gap: 20px;
    background: white;
    border-radius: 16px;
  }

  &__notification_text {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
  }

  &__notification_second_text {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
  }

  &__notification_button {
    font-weight: 600;
    width: fit-content;
  }
}
</style>

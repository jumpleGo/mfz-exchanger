<template>
  <div class="mfz_highload">
    <div class="mfz_highload__notification">
      <nuxt-img
        v-if="image"
        width="80px"
        height="80px"
        :src="image"
        class="mfz_highload__image"
      />
      <span class="mfz_highload__notification_text"> РЕЕЕЙД!!! </span>
      <span class="mfz_highload__notification_second_text">
        Очень много активных заявок. Попробуйте через пару минут!
      </span>
      <AppButton
        size="xs"
        title="перезагрузить"
        @click="reload"
        fluid
        class="mfz_highload__notification_button"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import AppButton from "~/components/App/AppButton.vue";
defineProps<{
  image: string;
}>();
const reload = () => {
  window.location.reload();
};
</script>
<style lang="scss" scoped>
.mfz_highload {
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

  &__image {
    animation: shake 0.5s ease-in-out infinite;
  }

  &__notification {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-width: 400px;
    height: fit-content;
    padding: 30px;
    gap: 20px;
    background: white;
    border-radius: 16px;
  }

  &__notification_text {
    text-align: center;
    font-size: 20px;
    font-family: "AGAT", serif !important;
    font-weight: 700;
  }

  &__notification_second_text {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
  }

  &__notification_button {
    font-weight: 600;
  }
}
</style>

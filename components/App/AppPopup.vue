<template>
  <div class="mfz_app_popup__bg"></div>
  <div class="mfz_app_popup__template">
    <div class="mfz_app_popup__wrapper-content bg-white rounded-lg">
      <div class="close" @click="close">✕</div>
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useMainStore } from "@/stores/main";
const { showModal } = storeToRefs(useMainStore());
const emit = defineEmits<{
  (e: "emit"): void;
}>();

const close = () => {
  showModal.value = false;
  emit("close");
};
</script>
<style lang="scss" scoped>
.close {
  font-size: 24px;
  line-height: 1;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
  color: #999;
  transition: color 0.2s ease;
  &:hover {
    cursor: pointer;
    color: #333;
  }
}
.mfz_app_popup__bg {
  position: fixed;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  z-index: 100;
  pointer-events: none;
  top: 0;
  left: 0;
}
.mfz_app_popup__template {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 1000;
  width: 100%;
}

.mfz_app_popup__wrapper-content {
  position: relative;
}
</style>

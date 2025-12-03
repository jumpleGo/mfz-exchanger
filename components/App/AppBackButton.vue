<template>
  <div class="app-back-button">
    <img src="/assets/icons/icon-left.svg" alt="">
  </div>
</template>
<style lang="scss" scoped>
.app-back-button {
  padding: 10px;
  background: $brand_yellow;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  opacity: 0.8;
  box-shadow: 0 0 5px 1px rgba(128, 128, 128, 0.44);
  height: fit-content;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }

  @include mobile-all {
    padding: 8px;
    border-radius: 8px;

    img {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
<script setup lang="ts">
</script>
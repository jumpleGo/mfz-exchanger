<template>
  <div class="app_loader">
    <div class="app_loader__image">⏳</div>
  </div>
</template>
<style lang="scss" scoped>
.app_loader {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  &__image {
    font-size: 50px;
    animation: shake 4s linear infinite;
  }
}
</style>

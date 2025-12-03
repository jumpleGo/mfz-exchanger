<template>
  <div class="app-loader">
    <div class="app-loader__wrapper">
      <div class="app-loader__logo">
        <img src="@/assets/logo/logo.png" alt="MFZ Logo" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    animation: shake 2s ease-in-out infinite;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: contain;
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotate(-10deg);
  }
  20%, 40%, 60%, 80% {
    transform: rotate(10deg);
  }
}
</style>

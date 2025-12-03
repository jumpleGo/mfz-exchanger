<template>
  <div 
    class="telegram-wrapper"
    :class="{ 'telegram-fullscreen': isFullscreen }"
    :style="telegramStyles"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const { telegramWebApp, isTelegramBrowser, isFullscreen } = useTelegramWebApp()

const telegramStyles = computed(() => {
  if (!isTelegramBrowser.value || !telegramWebApp.value) {
    return {}
  }

  const theme = telegramWebApp.value.themeParams

  return {
    '--tg-bg-color': theme.bg_color || '#ffffff',
    '--tg-text-color': theme.text_color || '#000000',
    '--tg-hint-color': theme.hint_color || '#999999',
    '--tg-link-color': theme.link_color || '#168acd',
    '--tg-button-color': theme.button_color || '#40a7e3',
    '--tg-button-text-color': theme.button_text_color || '#ffffff',
    '--tg-secondary-bg-color': theme.secondary_bg_color || '#f1f1f1',
  }
})
</script>

<style scoped lang="scss">
.telegram-wrapper {
  min-height: 100vh;
  background-color: var(--tg-bg-color, #ffffff);
  color: var(--tg-text-color, #000000);

  &.telegram-fullscreen {
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
</style>

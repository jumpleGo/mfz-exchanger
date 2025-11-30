export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el, binding) {
      // Флаг для предотвращения немедленного срабатывания
      let initialClick = true;

      const onClickOutside = (event) => {
        if (initialClick) {
          initialClick = false;
          return;
        }

        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event);
        }
      };

      el.__clickOutsideHandler__ = onClickOutside;

      document.addEventListener('click', onClickOutside);

      // Устанавливаем флаг после небольшого таймаута
      setTimeout(() => {
        initialClick = false;
      }, 0);
    },

    unmounted(el) {
      document.removeEventListener('click', el.__clickOutsideHandler__);
      delete el.__clickOutsideHandler__;
    },
  });
});

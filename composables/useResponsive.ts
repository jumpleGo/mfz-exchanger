
import debounce          from 'lodash.debounce';
import { computed, onMounted, ref } from 'vue'

export default () => {
  const isDesktop = ref(false);
  const isTablet  = ref(false);
  const isMobile  = ref(false);
  const isMobileS = ref(false);
  const isLoadingResize = ref(true)

  const clientWidthDetected = computed(() => isDesktop.value || isTablet.value || isMobile.value || isMobileS.value);

  const breakpoints = {
    desktopMin: 1024,
    tabletMin : 768,
    mobileS   : 340,
  };

  const setResponsive = debounce(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth || 0;
    const clientWidth    = document.documentElement.clientWidth + scrollbarWidth;

    if (clientWidth >= breakpoints.desktopMin) {
      // Desktop
      isDesktop.value = true;
      isTablet.value  = false;
      isMobile.value  = false;
      isMobileS.value = false;
    } else if (clientWidth >= breakpoints.tabletMin) {
      // Tablet
      isDesktop.value = false;
      isTablet.value  = true;
      isMobile.value  = false;
      isMobileS.value = false;
    } else if (clientWidth >= breakpoints.mobileS) {
      // Mobile
      isDesktop.value = false;
      isTablet.value  = false;
      isMobile.value  = true;
      isMobileS.value = false;
    } else {
      // MobileS
      isDesktop.value = false;
      isTablet.value  = false;
      isMobile.value  = true;
      isMobileS.value = true;
    }

    isLoadingResize.value = false
  }, 50);

  onMounted(() => {
    setResponsive();
    addEventListener('resize', setResponsive);
  });
  return { isLoadingResize, breakpoints, isDesktop, isTablet, isMobile, isMobileS, clientWidthDetected };
};

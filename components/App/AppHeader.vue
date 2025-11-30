<template>
  <header class="mfz_wrapper__header">
    <div class="mfz_wrapper__header-wrapper">
      <div class="mfz_wrapper__header--logo logo">💰</div>
      <div
        class="mfz_wrapper__header--burger"
        @click="menuOpened = true"
      >
        ☰
      </div>
      <div
        v-if="menuOpened"
        class="mfz_wrapper__header--close"
        @click="menuOpened = false"
      >
        ✕
      </div>
      <nav
        class="mfz_wrapper__header_navbar"
        :class="{ '--show': menuOpened }"
        @click="menuOpened = false"
      >
        <nuxt-link class="mfz_wrapper__header_navbar--link" to="/">
          главная
        </nuxt-link>
        <nuxt-link class="mfz_wrapper__header_navbar--link" to="/test/quiz">
          проверка знаний
        </nuxt-link>
        <nuxt-link class="mfz_wrapper__header_navbar--link" to="/products">
          продукты
        </nuxt-link>
        <nuxt-link class="mfz_wrapper__header_navbar--link" to="/blog">
          блог
        </nuxt-link>
        <AppButton
          to="/checkout"
          target="_self"
          :size="isMobile ? 'md' : 'xs'"
          title="начать обучение"
        />
      </nav>
      <AppLoginBlock v-if="userFromStore" />
      <nuxt-link
        v-else
        class="mfz_wrapper__header_navbar--link"
        to="/registration"
        >Регистрация</nuxt-link
      >
    </div>
  </header>
</template>
<script setup lang="ts">
import AppButton from "~/components/App/AppButton.vue";
const { isMobile } = useDevice();

const userStore = useUserStore();
const { user: userFromStore } = storeToRefs(userStore);
const menuOpened = shallowRef<boolean>(false);

withDefaults(
  defineProps<{
    showTest?: boolean;
  }>(),
  {
    showTest: true,
  },
);
</script>
<style lang="scss" scoped>
.mfz_wrapper__header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  z-index: 999;
  background: transparent;
  width: 100%;

  &-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    width: 100%;

    @include mobile {
      padding: 30px 15px;
      width: 100%;
    }

    @include mobile-xs {
      padding: 30px 15px;
      width: 100%;
    }

    @include tablet {
      padding: 30px 15px;
      width: 100%;
    }

    @include desktop {
      padding: 32px 40px;
    }

    @include desktop-lg {
      padding: 32px 40px;
    }
  }
}
.mfz_wrapper__header--close {
  position: fixed;
  z-index: 999;
  right: 20px;
  top: 30px;
}
.mfz_wrapper__header--burger,
.mfz_wrapper__header--close {
  font-size: 32px;
  cursor: pointer;
  
  @include not-mobile {
    display: none;
  }
}
.mfz_wrapper__header--logo {
  font-size: 40px;
  
  @include mobile {
    display: none;
  }

  @include mobile-xs {
    display: none;
  }

  @include tablet {
    font-size: 32px;
  }

  @include desktop {
    font-size: 48px;
  }

  @include desktop-lg {
    font-size: 60px;
  }
}
.mfz_wrapper__header_navbar {
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 10;
  @include mobile-all {
    display: none;
    position: fixed;
    flex-direction: column;
    padding: 40px;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 998;
    background: rgba(0, 0, 0, 0.8);
  }
}

.mfz_wrapper__header_navbar--link {
  text-decoration: none;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  color: white;
  text-transform: uppercase;

  @include mobile-all {
    padding: 10px 0;
  }
  @include tablet {
    font-size: 16px;
  }

  @include desktop {
    font-size: 14px;
  }

  @include desktop-lg {
    font-size: 16px;
  }

  &:hover {
    border-bottom-color: $brand_yellow;
    background: transparent;
  }
}
.deactive {
  pointer-events: none;
  position: relative;
  opacity: 0.5;
  &:after {
    content: "";
    position: absolute;
    display: block;
    top: -5px;
    right: -10px;
    width: 15px;
    height: 15px;
    background-image: url("/assets/clock.png");
    background-size: cover;
  }
}

.--show {
  display: flex !important;
}
</style>

<template>
  <div class="mfz__footer">
    <div class="mfz__footer-wrapper">
      <div class="mfz__footer_left_block">
        <div class="mfz__footer__logo logo">💰</div>
        <div class="mfz__footer__text">
          <h1>mfz</h1>
          <h5>money flow zen</h5>
        </div>
      </div>
      <div class="mfz__footer__links">
        <nuxt-link to="/" class="mfz__footer__link">Главная</nuxt-link>
        <nuxt-link to="/products" class="mfz__footer__link">Обучения</nuxt-link>
        <nuxt-link to="/blog" class="mfz__footer__link">Блог</nuxt-link>
        <nuxt-link to="/test" class="mfz__footer__link"
          >Проверка знаний</nuxt-link
        >
      </div>
      <div class="mfz__footer_right_block">
        <div class="mfz__footer__social_media">
          <nuxt-link
            to="https://t.me/mfz_crypto"
            target="_blank"
            class="mfz__footer_social"
          >
            📱
          </nuxt-link>
          <nuxt-link
            to="https://www.youtube.com/@money_flow_zen"
            target="_blank"
            class="mfz__footer_social"
          >
            ▶️
          </nuxt-link>
        </div>
        <p class="mfz__footer__info">
          для связи с автором <a href="https://t.me/mfz_owner">@mfz_owner</a>
        </p>
        <p class="mfz__footer__oferta">
          <nuxt-link
            target="_blank"
            href="https://cdn.moneyflowzen.ru/files/oferta_mfz.pdf"
            >публичная оферта</nuxt-link
          >
          <nuxt-link
            target="_blank"
            to="https://cdn.moneyflowzen.ru/files/privacy_policy.pdf"
            >политика обработки персональных данных</nuxt-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>
<style lang="scss" scoped>
.mfz__footer {
  background: black;
  z-index: 5;
  display: flex;

  &-wrapper {
    display: flex;
    flex: 1;

    @include mobile-xs {
      padding: 30px 15px;
      flex-direction: column;
      width: 100%;
      gap: 40px;
    }

    @include mobile {
      padding: 30px 15px;
      flex-direction: column;
      width: 100%;
      gap: 40px;
    }

    @include tablet {
      padding: 30px 15px;
      justify-content: space-between;
      width: 100%;
    }

    @include desktop {
      padding: 60px 40px;
      justify-content: space-between;
    }

    @include desktop-lg {
      padding: 60px 40px;
      justify-content: space-between;
    }
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  &__link {
    color: white;
    text-decoration: none;
    &:hover {
      color: $brand_yellow;
    }
  }
}
.mfz__footer_left_block {
  display: flex;
}
.mfz__footer__logo {
  font-size: 50px;
  line-height: 1;
}
.mfz__footer__text {
  text-transform: uppercase;
  margin-left: 10px;
  color: $brand_yellow;
  h1 {
    font-size: 25px;
    line-height: 25px;
    font-weight: 700;
    margin: unset;
  }
  h5 {
    font-size: 18px;
    line-height: 20px;
    margin: unset;
  }
}

.mfz__footer__social_media {
  display: flex;
  column-gap: 5px;
}
.mfz__footer_social {
  font-size: 30px;
  line-height: 1;
  text-decoration: none;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}
.mfz__footer__info {
  color: white;
  margin-top: 5px;
  a {
    text-decoration: none;
    color: $brand_yellow;
  }
}

.mfz__footer__oferta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  a {
    font-size: 16px;
    color: white;
    text-decoration: underline;
  }
}
</style>

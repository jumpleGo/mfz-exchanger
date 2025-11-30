<template>
  <NuxtLink :to="link" class="banner">
    <div class="banner__content">
      <img class="banner__image" :src="image" alt="banner" />
      <span class="banner__text">{{ text }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  image: string
  text: string
  link: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.banner {
  width: 100%;
  display: block;
  text-decoration: none;
  background: linear-gradient(to right, #f5f7fa, #e4e7eb);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;


  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  &__content {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    gap: 10px;
  }

  &__image {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
  }

  &__text {
    font-size: 16px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 640px) {
    .banner__text {
      font-size: 14px;
    }

    .banner__image {
      width: 28px;
      height: 28px;
    }
  }
}
</style>

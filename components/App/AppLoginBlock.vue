<template>
  <div class="app-user-telegram">
    <nuxt-img
      v-if="user?.photo_url"
      :preload="{ fetchPriority: 'high' }"
      loading="eager"
      :src="user?.photo_url"
      class="app-user-telegram__photo"
    />
    <span class="app-user-telegram__name">{{ user.email.split("@")[0] }}</span>
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "~/stores/user";

const { user } = storeToRefs(useUserStore());
</script>
<style lang="scss" scoped>
.app-user-telegram {
  padding: 5px 8px;
  background: rgba(211, 181, 45, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 50px;
  width: fit-content;
  right: 0;

  &__photo {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  &__name {
    color: #fff;
    font-size: 12px;
    @include mobile-all {
      max-width: 50%;
      text-overflow: ellipsis;
    }
  }
}
</style>

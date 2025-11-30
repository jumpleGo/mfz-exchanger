<template>
  <div :class="['app-chip', { '--active': selected }]" @click="emit('select')">
    <AppImage v-if="item?.image" :image="item.image" width="16" height="16" />
    <p class="app-chip__text">{{ item?.text || text }}</p>
  </div>
</template>
<script lang="ts" setup>
interface IChip {
  key: number;
  text: string;
  image?: string;
}

const props = defineProps<{
  item?: IChip;
  text: string;
  type: string;
  selected?: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
}>();
</script>
<style lang="scss" scoped>
.app-chip {
  display: flex;
  gap: 5px;
  padding: 8px 12px;
  font-size: 14px;
  color: black;
  background-color: white;
  border-radius: 8px;
  border: 1px solid white;

  &__text {
    margin: unset;
  }
}
.--active {
  border: 1px solid $brand_yellow;
  background-color: rgba(255, 194, 37, 0.86);
  color: black;
}
</style>

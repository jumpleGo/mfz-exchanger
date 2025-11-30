<template>
  <div>
    <div :class="['app-like', 'app-like--visible', {'app-like--active': liked}]" @click="like">
      <span class="app-like__icon">{{ liked ? '❤️' : '🤍' }}</span>
      <span class="app-like__count">{{ count }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'like'): void
}>()
const props = withDefaults(defineProps<{
  count?: number,
  liked: boolean
}>(), {
  count: 0
})

const like = () => {
  if (props.liked) return
  emit('like')
}
</script>
<style lang="scss" scoped>
.app-like {
  display: flex;
  align-items: center;
  padding: 5px 12px;
  gap: 5px;
  border: 1px solid white;
  width: fit-content;
  border-radius: 16px;
  opacity: 0;
  transition: 0.1s;
  &--visible {
    opacity: 1;
  }
  &--active {
    border-color: $brand_yellow;
  }
  &__count {
    font-size: 14px;
    font-weight: 300;
  }
  &__icon {
    font-size: 20px;
    line-height: 1;
  }
}
</style>
<template>
  <div class="radio-group">
    <slot />
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.radio-group {
  display: flex;
  gap: 1rem;
  max-width: 90vw;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>

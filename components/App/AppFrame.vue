<template>
  <iframe :class="['frame', {'--loaded-frame': loaded}]" :src="src" @load="loaded = true"></iframe>
</template>
<script lang="ts" setup>
defineProps<{
  src: string
}>()

const loaded = shallowRef<boolean>(false)
</script>
<style lang="scss" scoped>
.--loaded-frame {
  z-index: 1 !important;
}
.frame {
  z-index: -1;
}
</style>
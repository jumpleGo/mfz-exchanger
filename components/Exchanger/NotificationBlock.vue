<template>
  <div class="notification-block">
   <span v-html="text" />
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  text: String
}>()


</script>
<style lang="scss" scoped>
.notification-block {
  padding: 15px;
  box-shadow: 0 6px 10px #99a1aa26;
  background: #fff2cb;
  font-size: 14px;
  display: flex;
  justify-content: space-between;

  @include mobile-xs {
    width: unset;
    max-width: unset;
    font-size: 11px;
  }

}
</style>
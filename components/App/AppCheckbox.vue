<template>
  <label class="checkbox">
    <input
      class="checkbox__input"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', !modelValue)"
    />
    <span class="checkbox__box">
      <span class="checkbox__check" v-if="modelValue">✔</span>
    </span>
    <span class="checkbox__label"><slot /></span>
  </label>
</template>

<script setup lang="ts">
// Универсальный компонент с v-model
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;

  &__input {
    display: none;
  }

  &__box {
    width: 18px;
    height: 18px;
    border: 2px solid #ccc;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    transition: border-color 0.2s;
  }

  &__check {
    color: #111;
    font-size: 12px;
    line-height: 1;
  }

  &__label {
    font-size: 14px;
    color: #222;
  }

  &:hover &__box {
    border-color: #666;
  }
}
</style>
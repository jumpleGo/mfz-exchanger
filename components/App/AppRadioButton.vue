<template>
  <div class="radio-button">
    <input
      type="radio"
      :id="String(value)"
      :value="value"
      :name="name"
      :checked="selected === value"
      @change="emit('updateRadio', value)"
      hidden
    />
    <label :for="String(value)" :class="{ 'radio-selected': selected === value }">
      <slot></slot>
    </label>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
  selected: string | number,
  value: string | number,
  name: string
}>()

const emit = defineEmits<{
  (e: 'updateRadio', value: string | number) : void
}>()

</script>

<style lang="scss" scoped>
.radio-button {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.radio-button label {
  padding: 0.5rem 1rem;
  border: 2px solid #ccc;
  border-radius: 5px;
  transition: all 0.3s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.radio-button label.radio-selected {
  border-color: $brand_yellow;
  background-color: $brand_yellow;
  color: #000000;
}
</style>

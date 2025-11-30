<template>
  <div
    class="switch"
    :class="{ 'switch--on': modelValue }"
    @click="toggle"
  >
    <div class="switch__thumb"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

// Переключение значения
const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<style scoped>
.switch {
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}
.switch--on {
  background-color: #4caf50;
}
.switch__thumb {
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}
.switch--on .switch__thumb {
  transform: translateX(26px);
}
</style>

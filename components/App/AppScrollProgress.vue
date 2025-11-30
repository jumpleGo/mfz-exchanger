<template>
  <div class="progress-container">
    <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps<{
  readBlock: string
}>()
const emit = defineEmits<{
  (e: 'read80percent'): void
}>()

const scrollProgress = ref(0)
watch(scrollProgress, (value) => {
  if (value > 85) emit('read80percent')
})

const targetEl = ref<HTMLHtmlElement | null>(null)

const calculateProgress = () => {
  if (!targetEl.value) return

  const rect = targetEl.value.getBoundingClientRect()
  const windowHeight = window.innerHeight

  const blockStart = rect.top + window.scrollY
  const blockEnd = rect.bottom + window.scrollY
  const scrollTop = window.scrollY + windowHeight

  if (scrollTop < blockStart) {
    scrollProgress.value = 0
  } else if (scrollTop >= blockStart && scrollTop <= blockEnd) {
    const totalDistance = blockEnd - blockStart
    const currentDistance = scrollTop - blockStart
    scrollProgress.value = Math.min(100, Math.max(0, (currentDistance / totalDistance) * 100))
  } else if (scrollTop > blockEnd) {
    scrollProgress.value = 100
  }
}

onMounted(() => {
  targetEl.value = document.querySelector(`#${props.readBlock}`)

  if (!targetEl.value) {
    console.error('Элемент с таким селектором не найден:', props.readBlock)
    return
  }

  window.addEventListener('scroll', calculateProgress)
})

onUnmounted(() => {
  window.removeEventListener('scroll', calculateProgress)
})
</script>

<style scoped lang="scss">
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px; /* толщина линии */
  background-color: transparent;
  z-index: 9999;
}

.progress-bar {
  height: 100%;
  width: 0;
  background-color: $brand_yellow;
  transition: width 0.1s ease-out;
}
</style>

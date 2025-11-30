<template>
  <div 
    class="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.06] backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out"
    :class="isVisible ? 'translate-y-0' : 'translate-y-full'"
    :style="{ background: 'var(--card, #12161c)' }"
  >
    <div class="max-w-[1200px] mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
        <slot name="left" />
        <slot />
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

const isVisible = computed(() => props.visible)
</script>

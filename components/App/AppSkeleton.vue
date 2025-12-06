<template>
  <div 
    class="skeleton"
    :class="[variant, rounded ? 'rounded' : '']"
    :style="{ width, height }"
  />
</template>

<script lang="ts" setup>
interface Props {
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  rounded?: boolean;
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  variant: 'rectangular',
  rounded: false,
});
</script>

<style lang="scss" scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(222, 217, 210, 0.4) 0%,
    rgba(222, 217, 210, 0.6) 50%,
    rgba(222, 217, 210, 0.4) 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

.text {
  border-radius: 4px;
}

.circular {
  border-radius: 50%;
}

.rectangular {
  border-radius: 0;
}

.rounded {
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

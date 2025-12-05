<template>
  <Transition name="freeze-badge">
    <div v-if="isActive" class="freeze-badge">
      <div class="freeze-badge__wind">
        <div v-for="(style, i) in windStyles" :key="i" class="freeze-badge__wind-particle" :style="style"></div>
      </div>
      
      <div class="freeze-badge__container">
        <div class="freeze-badge__ice-texture"></div>
        
        <div class="freeze-badge__content">
          <svg class="freeze-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6"/>
          </svg>
          <span class="freeze-badge__text">1%</span>
        </div>
        
        <div class="freeze-badge__timer">
          <svg class="freeze-badge__timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          {{ formattedTime }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  isActive: boolean;
  expiresAt: number | null;
}>();

const remainingTime = ref(0);
let timerInterval: NodeJS.Timeout | null = null;

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formattedTime = computed(() => formatTime(remainingTime.value));

const updateTimer = () => {
  if (!props.expiresAt) {
    remainingTime.value = 0;
    return;
  }
  
  const remaining = props.expiresAt - Date.now();
  remainingTime.value = remaining > 0 ? remaining : 0;
};

const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

watch(() => props.isActive, (isActive) => {
  if (isActive && props.expiresAt) {
    startTimer();
  } else {
    stopTimer();
  }
}, { immediate: true });

watch(() => props.expiresAt, (newExpiresAt) => {
  if (newExpiresAt && props.isActive) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});

const windStyles = Array.from({ length: 15 }, () => {
  const top = Math.random() * 100;
  const animationDelay = Math.random() * 3;
  const animationDuration = 2 + Math.random() * 2;
  const height = 1 + Math.random() * 2;
  
  return {
    top: `${top}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
    height: `${height}px`,
  };
});
</script>

<style scoped lang="scss">
.freeze-badge {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  
  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
  }
}

.freeze-badge__wind {
  position: absolute;
  inset: -50%;
  pointer-events: none;
  overflow: hidden;
}

.freeze-badge__wind-particle {
  position: absolute;
  left: -100px;
  width: 80px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: wind-blow linear infinite;
  border-radius: 2px;
}

@keyframes wind-blow {
  0% {
    transform: translateX(-100px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px));
    opacity: 0;
  }
}

.freeze-badge__container {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  box-shadow: 
    inset 0 0 20px rgba(255, 255, 255, 0.15),
    0 4px 15px rgba(0, 212, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  overflow: hidden;
  animation: pulse-glow 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      inset 0 0 20px rgba(255, 255, 255, 0.15),
      0 4px 15px rgba(0, 212, 255, 0.3);
  }
  50% {
    box-shadow: 
      inset 0 0 25px rgba(255, 255, 255, 0.2),
      0 4px 20px rgba(0, 212, 255, 0.5);
  }
}

.freeze-badge__ice-texture {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  border-radius: 16px;
  pointer-events: none;
}

.freeze-badge__content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.freeze-badge__icon {
  width: 24px;
  height: 24px;
  color: #00d4ff;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6));
  animation: spin-slow 6s linear infinite;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.freeze-badge__text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 
    0 0 15px rgba(0, 212, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.freeze-badge__timer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.4);
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.35rem 0.625rem;
  }
}

.freeze-badge__timer-icon {
  width: 14px;
  height: 14px;
  color: #00d4ff;
  
  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
  }
}

.freeze-badge-enter-active,
.freeze-badge-leave-active {
  transition: all 0.4s ease;
}

.freeze-badge-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.freeze-badge-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}
</style>

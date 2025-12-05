<template>
  <Teleport to="body">
    <Transition name="freeze-modal">
      <div v-if="show" class="freeze-modal-overlay" @click="close">
        <div class="freeze-modal-overlay__wind">
          <div v-for="(style, i) in windStyles" :key="i" class="freeze-modal-overlay__wind-particle" :style="style"></div>
        </div>
        
        <div class="freeze-modal" @click.stop>
          <div class="freeze-modal__ice-border"></div>
          
          <div class="freeze-modal__snowflakes">
            <div v-for="(style, i) in snowflakeStyles" :key="i" class="freeze-modal__snowflake" :style="style">
              ❄
            </div>
          </div>
          
          <div class="freeze-modal__content">
            <div class="freeze-modal__icon">
              <svg class="freeze-modal__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h20M6 6l12 12M6 18L18 6M8 2h8M8 22h8M2 8v8M22 8v8"/>
              </svg>
            </div>
            
            <h2 class="freeze-modal__title">
              FREEEEEEZZZZE!
            </h2>
            
            <div class="freeze-modal__text">
              <div class="freeze-modal__emoji">❄️</div>
              <p>
                Комиссия <span class="freeze-modal__highlight">1%</span> на 1 сделку
              </p>
              <p>
                с любой парой в течение <span class="freeze-modal__highlight">5 минут</span>
              </p>
            </div>
            
            <div class="freeze-modal__timer">
              <svg class="freeze-modal__timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>{{ formattedTime }}</span>
            </div>
            
            <button @click="close" class="freeze-modal__btn">
              Начать обмен
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  expiresAt: number | null;
}>();

const emit = defineEmits<{
  close: [];
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

watch(() => props.show, (isShown) => {
  if (isShown && props.expiresAt) {
    startTimer();
  } else {
    stopTimer();
  }
}, { immediate: true });

watch(() => props.expiresAt, (newExpiresAt) => {
  if (newExpiresAt && props.show) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});

const close = () => {
  emit('close');
};

const snowflakeStyles = Array.from({ length: 20 }, () => {
  const left = Math.random() * 100;
  const animationDelay = Math.random() * 5;
  const animationDuration = 3 + Math.random() * 4;
  const fontSize = 10 + Math.random() * 15;
  
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
    fontSize: `${fontSize}px`,
  };
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
.freeze-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow: hidden;
}

.freeze-modal-overlay__wind {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.freeze-modal-overlay__wind-particle {
  position: absolute;
  left: -100px;
  width: 100px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  animation: wind-blow-overlay linear infinite;
  border-radius: 2px;
}

@keyframes wind-blow-overlay {
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

.freeze-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 
    inset 0 0 40px rgba(255, 255, 255, 0.1),
    0 8px 32px rgba(0, 212, 255, 0.3),
    0 0 80px rgba(0, 212, 255, 0.2);
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    max-width: 340px;
  }
}

.freeze-modal__ice-border {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(0, 212, 255, 0.3), rgba(255, 255, 255, 0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.6;
  }
}

.freeze-modal__snowflakes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 24px;
}

.freeze-modal__snowflake {
  position: absolute;
  top: -20px;
  color: rgba(255, 255, 255, 0.8);
  animation: snowfall linear infinite;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

@keyframes snowfall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 20px)) rotate(360deg);
    opacity: 0;
  }
}

.freeze-modal__content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.freeze-modal__icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin-slow 8s linear infinite;
  
  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
  }
}

.freeze-modal__icon-svg {
  width: 100%;
  height: 100%;
  color: #00d4ff;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.freeze-modal__title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 
    0 0 20px rgba(0, 212, 255, 0.8),
    0 0 40px rgba(0, 212, 255, 0.4);
  letter-spacing: 3px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }
}

.freeze-modal__text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.freeze-modal__emoji {
  font-size: 2.5rem;
  animation: pulse 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.freeze-modal__highlight {
  color: #00d4ff;
  font-weight: 700;
  font-size: 1.3em;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
}

.freeze-modal__timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 212, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  font-size: 1.25rem;
  font-weight: 600;
  color: #00d4ff;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.6rem 1.2rem;
  }
}

.freeze-modal__timer-icon {
  width: 24px;
  height: 24px;
  color: #00d4ff;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
}

.freeze-modal__btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0a2540;
  background: linear-gradient(135deg, #00d4ff, #00a8cc);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(0, 212, 255, 0.4),
    inset 0 -2px 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 20px rgba(0, 212, 255, 0.6),
      inset 0 -2px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

.freeze-modal-enter-active,
.freeze-modal-leave-active {
  transition: opacity 0.3s ease;
  
  .freeze-modal {
    transition: transform 0.3s ease;
  }
}

.freeze-modal-enter-from,
.freeze-modal-leave-to {
  opacity: 0;
  
  .freeze-modal {
    transform: scale(0.9);
  }
}
</style>

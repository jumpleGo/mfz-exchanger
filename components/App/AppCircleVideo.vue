<template>
  <div
    class="relative inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Круглое видео -->
    <div
      :style="{ width: `${size}px`, height: `${size}px` }"
      class="relative overflow-hidden rounded-full bg-black"
    >
      <video
        ref="videoElement"
        :src="src"
        class="w-full h-full object-cover pointer-events-none"
        @timeupdate="updateProgress"
        @loadedmetadata="onVideoLoaded"
        @ended="onVideoEnded"
        muted
        loop
        playsinline
        webkit-playsinline
        disablePictureInPicture
        x-webkit-airplay="deny"
        :controls="false"
      />

      <!-- Круговой прогресс-бар (показывается при наведении) -->
      <svg
        v-show="isHovered || isDragging"
        class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        :style="{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }"
      >
        <!-- Фоновый круг -->
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          :stroke-width="strokeWidth"
        />
        <!-- Прогресс -->
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          stroke="white"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          stroke-linecap="round"
        />
      </svg>

      <!-- Иконка звука сверху -->
      <button
        @click.stop="toggleMute"
        class="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 md:w-8 md:h-8 max-md:w-10 max-md:h-10 flex items-center border-0 justify-center rounded-full bg-black/50 hover:bg-black/70 transition-all z-[100] pointer-events-auto touch-action-none max-md:p-3"
      >
        <svg
          v-if="isMuted"
          class="w-4 h-4 max-md:w-5 max-md:h-5 text-white pointer-events-none"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
        <svg
          v-else
          class="w-4 h-4 max-md:w-5 max-md:h-5 text-white pointer-events-none"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
          />
        </svg>
      </button>

      <!-- Контролы -->
      <div
        v-show="showControls || isHovered || !isPlaying"
        class="absolute inset-0 flex items-center justify-center gap-2 transition-opacity pointer-events-none"
      >
        <button
          v-if="!isPlaying"
          @click.stop="togglePlay"
          class="flex items-center justify-center rounded-full border-0 transition-all hover:scale-110 text-white bg-transparent size-10 max-md:size-14 z-[100] pointer-events-auto touch-action-none max-md:p-4"
        >
          <svg class="w-6 h-6 ml-1 max-md:w-8 max-md:h-8 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          v-else
          @click.stop="togglePlay"
          class="w-12 h-12 max-md:w-16 max-md:h-16 flex items-center justify-center border-0 rounded-full transition-all hover:scale-110 z-[100] pointer-events-auto touch-action-none max-md:p-4"
        >
          <svg class="w-6 h-6 max-md:w-8 max-md:h-8 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

interface Props {
  src: string;
  size?: number;
  strokeWidth?: number;
  shouldAutoplay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  strokeWidth: 4,
  shouldAutoplay: true,
});

const videoElement = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isHovered = ref(false);
const isDragging = ref(false);
const isMuted = ref(true);
const currentTime = ref(0);
const duration = ref(0);
const showControls = ref(true);
let controlsTimer: ReturnType<typeof setTimeout> | null = null;

const radius = computed(() => props.size / 2 - props.strokeWidth / 2 - 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const progress = computed(() =>
  duration.value > 0 ? currentTime.value / duration.value : 0,
);
const progressOffset = computed(
  () => circumference.value * (1 - progress.value),
);

const hideControlsAfterDelay = () => {
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
  showControls.value = true;
  controlsTimer = setTimeout(() => {
    if (isPlaying.value && !isHovered.value) {
      showControls.value = false;
    }
  }, 3000);
};

const handleMouseEnter = () => {
  isHovered.value = true;
  showControls.value = true;
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
};

const handleMouseLeave = () => {
  isHovered.value = false;
  if (isPlaying.value) {
    hideControlsAfterDelay();
  }
};

const togglePlay = () => {
  if (!videoElement.value) return;

  if (isPlaying.value) {
    videoElement.value.pause();
    isPlaying.value = false;
    showControls.value = true;
    if (controlsTimer) {
      clearTimeout(controlsTimer);
    }
  } else {
    videoElement.value.play();
    isPlaying.value = true;
    hideControlsAfterDelay();
  }
};

const toggleMute = () => {
  if (!videoElement.value) return;

  isMuted.value = !isMuted.value;
  videoElement.value.muted = isMuted.value;
};

const updateProgress = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime;
  }
};

const onVideoLoaded = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration;
  }
};

const onVideoEnded = () => {
  isPlaying.value = false;
};

const stopAndReset = () => {
  if (videoElement.value) {
    videoElement.value.pause();
    videoElement.value.currentTime = 0;
    isPlaying.value = false;
    currentTime.value = 0;
  }
};

// Expose метод для вызова извне
defineExpose({
  stopAndReset,
});

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.load();
    
    // Intersection Observer для autoplay (только если разрешено)
    if (props.shouldAutoplay) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isPlaying.value && props.shouldAutoplay) {
              // Видео появилось в viewport - автоматически запускаем
              videoElement.value?.play();
              isPlaying.value = true;
              hideControlsAfterDelay();
            }
          });
        },
        { threshold: 0.5 } // Срабатывает когда 50% видео в viewport
      );
      
      observer.observe(videoElement.value);
      
      // Сохраняем observer для очистки
      (videoElement.value as any)._observer = observer;
    }
  }
});

onBeforeUnmount(() => {
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
  
  // Отключаем observer
  if (videoElement.value && (videoElement.value as any)._observer) {
    (videoElement.value as any)._observer.disconnect();
  }
});
</script>

<style scoped>
video::-webkit-media-controls {
  display: none !important;
}

video::-webkit-media-controls-enclosure {
  display: none !important;
}

video::-webkit-media-controls-panel {
  display: none !important;
}

video::-webkit-media-controls-play-button {
  display: none !important;
}

video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

video::-moz-media-controls {
  display: none !important;
}

video::--webkit-media-controls-overlay-play-button {
  display: none !important;
}

button {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

/* Увеличиваем кликабельную область на touch устройствах */
@media (pointer: coarse) {
  button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>

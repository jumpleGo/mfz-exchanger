<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <!-- Close Button -->
          <button
            class="modal-close"
            @click="closeModal"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Thumbnail Image -->
          <div class="modal-image-wrapper">
            <img
              :src="thumbnail"
              :alt="title"
              class="modal-image"
              @load="onImageLoad"
              @error="onImageError"
            />
          </div>

          <!-- Content Section -->
          <div class="modal-body">
            <!-- Title -->
            <h2 class="modal-title">{{ title }}</h2>

            <!-- Description Text -->
            <p class="modal-description" v-html="description" />

            <!-- Additional Content Slot -->
            <slot></slot>

            <!-- Action Button -->
            <AppButton
              fluid
              :disabled="isLoading"
              size="md"
              :title="buttonText"
              @click="handleButtonClick"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import AppButton from "~/components/App/AppButton.vue";

interface Props {
  modelValue: boolean;
  thumbnail: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void | Promise<void>;
  cookieName?: string;
  cookieExpireDays?: number;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: "Continue",
  cookieExpireDays: 30,
  cookieName: "modal_viewed",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "button-click": [];
}>();

const isOpen = ref(props.modelValue);

const isLoading = ref(false);
const imageError = ref(false);

/**
 * Sync isOpen with modelValue prop
 */
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  },
);

/**
 * Set cookie when modal is viewed
 */
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

/**
 * Close modal and set cookie
 */
const closeModal = () => {
  setCookie(props.cookieName, "true", props.cookieExpireDays);
  isOpen.value = false;
  emit("update:modelValue", false);
};

/**
 * Handle button click with optional async action
 */
const handleButtonClick = async () => {
  emit("button-click");

  if (props.buttonAction) {
    isLoading.value = true;
    try {
      await props.buttonAction();
    } catch (error) {
      console.error("Button action error:", error);
    } finally {
      isLoading.value = false;
    }
  }

  closeModal();
};

/**
 * Handle successful image load
 */
const onImageLoad = () => {
  imageError.value = false;
};

/**
 * Handle image load error
 */
const onImageError = () => {
  imageError.value = true;
  console.error(`Failed to load image: ${props.thumbnail}`);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-body {
  padding: 32px 24px 24px;
}

.modal-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.modal-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.modal-button {
  width: 100%;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.modal-button:active:not(:disabled) {
  transform: translateY(0);
}

.modal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    margin: 20px;
  }

  .modal-body {
    padding: 24px 16px 16px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-description {
    font-size: 13px;
  }

  .modal-image-wrapper {
    height: 200px;
  }
}
</style>

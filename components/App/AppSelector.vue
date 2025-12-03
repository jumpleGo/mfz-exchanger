<template>
  <div class="app_selector">
    <div
      :class="['app_selector__input', { error: error }]"
      @click="isOpenList = !isOpenList"
    >
      <span v-if="modelValue.name">{{ modelValue.name }}</span>
      <span v-else class="--placeholder">{{ placeholder }}</span>
      <img
          src="/assets/down-arrow.png"
          :class="['app_selector__icon', { '--opened': isOpenList }]"
      />
    </div>
    <div v-if="isOpenList" ref="itemsContainer" class="app_selector__items">
      <div
        :class="[
          'app_selector__item',
          { '--active': option.key === modelValue.key },
        ]"
        v-for="option in options"
        :key="option.key"
        :ref="(el) => setItemRef(el, option.key)"
        @click="selectItem(option)"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { IOption } from "~/components/App/types";
const emit = defineEmits<{
  (e: "update:modelValue", option: IOption): void;
}>();
const props = defineProps<{
  options: IOption[];
  placeholder?: string;
  id: string;
  modelValue: IOption;
  error?: boolean;
}>();

const isOpenList = shallowRef(false);
const itemsContainer = ref<HTMLElement | null>(null);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());

const setItemRef = (el: any, key: string) => {
  if (el) {
    itemRefs.value.set(key, el);
  }
};

const selectItem = (option: IOption) => {
  emit("update:modelValue", option);
  isOpenList.value = false;
};

// Прокрутка к выбранному элементу при открытии списка
watch(isOpenList, async (isOpen) => {
  if (isOpen && props.modelValue.key) {
    await nextTick();
    const selectedElement = itemRefs.value.get(props.modelValue.key);
    if (selectedElement && itemsContainer.value) {
      const containerRect = itemsContainer.value.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      const relativeTop = selectedElement.offsetTop;
      const offset = relativeTop - (itemsContainer.value.clientHeight / 2) + (elementRect.height / 2);
      itemsContainer.value.scrollTop = offset;
    }
  }
  
  // Очищаем refs при закрытии
  if (!isOpen) {
    itemRefs.value.clear();
  }
});
</script>
<style lang="scss" scoped>
.app_selector {
  display: flex;
  position: relative;
  width: 100%;
  &__items {
    position: absolute;
    left: 0;
    width: 100%;
    top: 41px;
    border-radius: 20px;
    z-index: 2;
    max-height: 300px;
    overflow-y: auto;
  }

  &__item {
    padding: 10px 20px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 16px;
    &:first-child {
      border-radius: 20px 20px 0 0;
    }
    &:last-child {
      border-radius: 0 0 20px 20px;
    }

    &:hover {
      cursor: pointer;
      border: 1px solid $brand_yellow;
      background: rgb(255, 240, 199);
    }
  }

  &__icon {
    position: absolute;
    right: 20px;
    width: auto;
    height: 20px;
    top: 12px;
    transform: rotate(0deg);
    transition: 0.2s;
  }

  .--active {
    border: 1px solid $brand_yellow;
    background: rgb(255, 240, 199);
  }
  .--placeholder {
    color: #cecece;
  }
  .--opened {
    transform: rotate(-180deg);
    transition: 0.2s;
  }
}

.app_selector__input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 400;
  outline: unset;
  border: 1px solid $brand_yellow;
  background: white;
  position: relative;

  &:hover {
    cursor: pointer;
  }
}

.error {
  border: 1px solid $error;
}
.slot {
  text-align: right;
}
.slot-error {
  font-size: 13px;
  color: $error;
}
</style>

<template>
  <div class="app_input">
    <label v-if="label" :for="id" class="app_input__label">{{ label }}</label>
    <div
      v-if="showAddress"
      :class="[
        'app_input__address__content',
        { '--valid': valid },
        { '--invalid': invalid },
      ]"
    >
      <div>
        {{ formatCryptoAddress(modelValueRef, 5, 5) }}
      </div>
      <div
        class="app_input__address__icon"
        @click="clearAddress"
      >✕</div>
    </div>
    <div v-else class="app_input__label-wrapper">
      <input
        v-model="modelValueRef"
        :disabled="disabled"
        :type="type"
        :id="id"
        aria-autocomplete="none"
        v-maska="maskaOptions"
        :placeholder="placeholder"
        :class="[
          'app_input__input',
          { error: error },
          { '--valid': valid },
          { '--success': valid },
        ]"
        @blur="emit('blur')"
        autocomplete="off"
        @paste="onPaste"
      />
      <span
        v-if="paste && !modelValue"
        class="app_input__paste"
        @click="onPaste"
        >Вставить</span
      >
    </div>
    <div class="slots">
      <div class="slot-error">
        <slot name="error" />
      </div>
      <div class="slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatCryptoAddress } from "@/components/Exchanger/helpers/exchanger";

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "blur"): void;
  (e: "paste"): void;
}>();
const props = withDefaults(
  defineProps<{
    id: string;
    placeholder?: string;
    label?: string;
    type?: string;
    modelValue?: string | number;
    error?: boolean;
    disabled?: boolean;
    editable?: boolean;
    paste?: boolean;
    valid?: boolean;
    invalid?: boolean;
    maskaOptions?: Record<string, any>;
  }>(),
  {
    editable: true,
    type: "text",
    maskaTokens: undefined,
  },
);

const modelValueRef = useModel(props, "modelValue");
const showAddress = shallowRef(false);

watch(modelValueRef, (address) => {
  if (!address) showAddress.value = false;
});
const onPaste = async () => {
  const text = await navigator.clipboard.readText();
  if (text) {
    emit("update:modelValue", text);
    if (props.id === "address") {
      showAddress.value = true;
    }
  }
};

const clearAddress = async () => {
  showAddress.value = false;
  emit("update:modelValue", "");
};
</script>
<style lang="scss" scoped>
.app_input__address__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 400;
  outline: unset;
  border: 1px solid rgba(255, 188, 14, 0.76);
  background: rgba(255, 213, 103, 0.28);

  @include mobile-all {
    font-size: 14px;
  }
}
.--valid {
  border: 1px solid rgba(0, 122, 2, 0.76);
  background: rgba(183, 255, 170, 0.28);
}
.--invalid {
  border: 1px solid rgba(225, 0, 0, 0.76);
  background: rgba(255, 98, 98, 0.28);
}
.app_input__address__icon {
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
  
  &:hover {
    color: #000;
  }
}
.app_input {
  display: flex;
  flex-direction: column;
  &__label {
    margin-bottom: 8px;
    @include mobile-all {
      font-size: 14px;
    }
  }
  &__paste {
    position: absolute;
    color: $brand-yellow;
    bottom: 12px;
    right: 15px;
    &:hover {
      cursor: pointer;
    }

    @include mobile-all {
      font-size: 12px;
    }
  }
  &__label-wrapper {
    display: flex;
    width: 100%;
    position: relative;
  }
  &__input {
    padding: 10px 15px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 400;
    outline: unset;
    border: 1px solid $brand_yellow;
    width: 100%;
    @include mobile-all {
      font-size: 16px;
    }
  }
}

.error {
  border: 1px solid $error;
}
.--success {
  border: 1px solid rgba(0, 122, 2, 0.76);
}
.slots {
  display: flex;
  align-items: center;
  justify-content: space-between;
  @include mobile-all {
    font-size: 12px;
  }
}
.slot {
  text-align: right;
}
.slot-error {
  font-size: 13px;
  color: $error;
  @include mobile-all {
    font-size: 12px;
  }
}
</style>

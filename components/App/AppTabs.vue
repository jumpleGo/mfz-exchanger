<script setup lang="ts">
interface Tab {
  key: string;
  title: string;
  count?: number;
}
const props = defineProps<{ tabs: Tab[]; modelValue: string }>();
const emit = defineEmits(["update:modelValue"]);
function setActive(k: string) {
  emit("update:modelValue", k);
}
</script>

<template>
  <div class="tabs">
    <button
      v-for="t in props.tabs"
      :key="t.key"
      class="tab"
      :class="{ active: t.key === props.modelValue }"
      @click="setActive(t.key)"
    >
      <span class="title">{{ t.title }}</span>
      <span v-if="t.count !== undefined" class="count">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(41, 42, 48, 0.55);
  border: 1px solid rgba(42, 49, 73, 0.6);
  color: $white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  .count {
    color: $muted;
    font-weight: 700;
    min-width: 24px;
    text-align: center;
    display: inline-block;
  }
  &:hover {
    border-color: rgba(87, 151, 185, 0.8);
  }
  &.active {
    background: linear-gradient(
      135deg,
      rgba(45, 95, 202, 0.25),
      rgba(87, 151, 185, 0.25)
    );
    border-color: rgba(87, 151, 185, 0.9);
    .count {
      color: $white;
    }
  }
}
</style>

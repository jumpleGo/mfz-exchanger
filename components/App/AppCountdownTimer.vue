<template>
  <div class="countdown-timer" v-if="!isEmptyTimer">
    <div class="countdown-timer__time">{{ Number(timer.d) }}д</div>
    <span>:</span>
    <div class="countdown-timer__time">{{ Number(timer.h) }}ч</div>
    <span>:</span>
    <div class="countdown-timer__time">{{ timer.m }}м</div>
    <ClientOnly>
      <span>:</span>
      <div class="countdown-timer__time">{{ timer.s }}с</div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  endDate: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#864d20",
});

const { timer, isEmptyTimer } = useCountdown(props.endDate);
</script>

<style lang="scss" scoped>
.countdown-timer {
  display: flex;
  align-items: center;
  gap: 4px;

  &__time {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 4px;
    border: 1px solid v-bind(color);
    border-radius: 4px;
    color: v-bind(color);
  }

  span {
    color: v-bind(color);
  }
}
</style>

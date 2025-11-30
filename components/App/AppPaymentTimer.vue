<template>
  <div class="payment-timer">{{ formattedTime }}</div>
</template>

<script lang="ts" setup>
interface Props {
  expirationTime: string;
  fontSize?: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: "40px",
  color: "inherit",
});

const emit = defineEmits<{
  timeout: [];
}>();

const formattedTime = ref("00:00");
let intervalId: NodeJS.Timeout | null = null;

const getTimeRemaining = () => {
  const t = Date.parse(new Date(props.expirationTime)) - Date.parse(new Date());
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);

  return {
    total: t,
    minutes,
    seconds,
  };
};

const updateTimer = () => {
  const t = getTimeRemaining();

  if (t.total <= 0) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    formattedTime.value = "00:00";
    emit("timeout");
    return;
  }

  formattedTime.value =
    (t.minutes < 10 ? "0" + t.minutes : t.minutes) +
    ":" +
    (t.seconds < 10 ? "0" + t.seconds : t.seconds);
};

onMounted(() => {
  if (!props.expirationTime) return;

  // Первое обновление
  updateTimer();

  // Запускаем интервал
  intervalId = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
</script>

<style lang="scss" scoped>
.payment-timer {
  font-size: v-bind(fontSize);
  color: v-bind(color);
  font-weight: 600;
  text-align: center;

  @include mobile-all {
    margin: 40px 0;
  }
}
</style>

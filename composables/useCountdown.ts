import { DateTime } from "luxon";

const timeRemaining = (targetDate: string) => {
  // Разбиваем строку на части (день, месяц, год, часы, минуты)
  const [day, month, year, hour, minute] = targetDate
    .split(/[\s.]+/)
    .map((part) => parseInt(part));

  const target = DateTime.local(year, month, day, hour, minute).setZone(
    "Europe/Moscow",
  );

  // Получаем текущее время в Москве (UTC+3)
  const now = DateTime.now().setZone("Europe/Moscow");

  // Вычисляем разницу в миллисекундах
  const diff = target.toMillis() - now.toMillis();

  // Если дата прошла, возвращаем объект с нулевыми значениями
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  // Преобразуем разницу в дни, часы, минуты, секунды
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 1000 / 60) % 60;
  const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
};

export const useCountdown = (endDate?: string) => {
  if (!endDate) return { timerInterval: null, timer: {} };
  const { days, hours, minutes, seconds } = timeRemaining(endDate);
  const isEmptyTimer = shallowRef(false);
  // Состояние для хранения таймера
  const timer = ref<Record<string, any>>({
    d: days,
    h: hours,
    m: minutes,
    s: seconds,
  });

  // Ссылка на интервал таймера
  const timerInterval = ref();
  const isEmptyTimeBlock = (timeBlock: string) =>
    timeBlock === "00" || !timeBlock;

  const setTimer = () => {
    clearInterval(timerInterval.value);

    timerInterval.value = setInterval(() => {
      const { days, hours, minutes, seconds } = timeRemaining(endDate);

      // Обновляем значения таймера
      timer.value.d = String(days).padStart(2, "0");
      timer.value.h = String(hours).padStart(2, "0");
      timer.value.m = String(minutes).padStart(2, "0");
      timer.value.s = String(seconds).padStart(2, "0");

      // Останавливаем таймер, если отсчет завершен
      if (
        [timer.value.d, timer.value.h, timer.value.m, timer.value.s].every(
          isEmptyTimeBlock,
        )
      ) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
    }, 1000);
  };

  onUnmounted(() => {
    clearInterval(timerInterval.value);
  });

  onMounted(() => {
    if (
      [timer.value.d, timer.value.h, timer.value.m, timer.value.s].every(
        isEmptyTimeBlock,
      )
    ) {
      isEmptyTimer.value = true;
      return;
    }

    setTimer();
  });

  return {
    timer,
    isEmptyTimeBlock,
    timerInterval,
    isEmptyTimer,
  };
};

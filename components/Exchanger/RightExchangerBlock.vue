<template>
  <div :class="[{ '--disabled-block': !isSelectedBothItem }]">
    <div class="exchanger__right__content-wrapper">
      <div class="exchanger__right__content">
        <div class="exchanger__right__content--header">
          <AppBackButton
            @click="emit('back')"
            class="exchanger__right__content-back"
          />
          <div class="exchanger__content--title-wrapper">
            <h2 class="exchanger__content--title">
              Обмен <span>{{ selectedSell?.title || "..." }}</span>
            </h2>
            <h2 class="exchanger__content--title">
              на <span>{{ selectedBuy?.title || "..." }}</span>
            </h2>
          </div>
        </div>

        <div class="exchanger__inputs">
          <AppInput
            v-model="sumInputModel"
            id="sum"
            :disabled="promoApplied"
            :error="isUserInteracted && !countValidate"
            placeholder="Сумма обмена"
            class="exchanger__inputs__count"
            :label="sumLabel"
            @input="handleSumInput"
          >
            <template v-if="isUserInteracted && !countValidate" #error>
              {{
                !countValidate &&
                translates.limit(
                  isCryptoForSell
                    ? minmaxLimit[selectedSell.key]
                    : minmaxLimit[selectedBuy.key],
                )
              }}
            </template>
          </AppInput>
          <AppInput
            v-model="receivedInputModel"
            id="received"
            :disabled="promoApplied"
            placeholder="Вы получите"
            :label="receivedAmountLabel"
            class="exchanger__inputs__received"
            @input="handleReceivedInput"
          />
          <AppInput
            v-model="v$.telegram.$model"
            :error="v$.telegram.$error"
            id="mail"
            placeholder="@user"
            label="Телеграм ник"
          >
            <template v-if="v$.telegram.$error" #error>{{
              v$.telegram.$error && translates.telegram
            }}</template>
          </AppInput>
          <div class="exchanger__inputs__address">
            <AppInput
              v-if="!isStarsBuy"
              v-model="v$.address.$model"
              paste
              class="exchanger__inputs__address__address-input"
              :error="v$.address.$error"
              :valid="isOKAddress && isAddressChecked"
              :invalid="!isOKAddress && isAddressChecked"
              id="address"
              :placeholder="placeholderAddress"
              :label="placeholderAddress"
            >
              <template v-if="v$.address.$error" #error
                ><span>{{
                  v$.address.$error && translates.address
                }}</span></template
              >
              <span
                v-if="isAddressChecked && !v$.address.$error"
                :class="[
                  'exchanger__inputs__address__slot',
                  { '--slot-error': !isOKAddress },
                  { '--slot-success': isOKAddress },
                ]"
                >{{
                  isOKAddress
                    ? `корректный адрес ${currentAddressNet}`
                    : `некорректный адрес ${currentAddressNet}`
                }}</span
              >
            </AppInput>
          </div>
          <AppSelector
            v-if="isNetShow"
            v-model="netModel"
            :error="v$.net.$error"
            id="net"
            placeholder="сеть"
            :options="usdtNet"
          />
          <span v-if="isNetShow" class="tip">(комиссия оплачивается вами)</span>
          <div class="exchanger__promocode">
            <div class="exchanger__inputs__promocode-wrapper">
              <AppInput
                v-model="promocode"
                class="exchanger__inputs__promocode"
                id="promocode"
                placeholder="Промокод"
                :disabled="promoApplied"
                :valid="promoApplied"
                :error="!!promocodeError"
              >
                <template #error>
                  <span>{{ promocodeError }}</span>
                </template>
              </AppInput>
              <AppButton
                v-if="!promoApplied"
                class="exchanger__buttons__promocode"
                title="применить"
                size="xs"
                :disabled="!promocode.trim()"
                @click="applyPromocode"
              />
              <AppButton
                v-if="promoApplied"
                class="exchanger__buttons__promocode"
                title="удалить"
                size="xs"
                @click="removePromocode"
              />
            </div>
            <div
              v-if="promoApplied"
              class="exchanger__promocode-economy"
              v-html="yourEconomyWithPromoText"
            />
          </div>
        </div>
      </div>
      <AppButton
        title="создать заявку"
        :disabled="!enabledButton"
        @click="validateForm"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * Компонент правого блока обмена криптовалюты
 *
 * @description Основная форма для создания заявки на обмен криптовалюты
 *
 * @features
 * - Двусторонний ввод: можно вводить как сумму криптовалюты, так и сумму фиата
 * - Маска ввода: форматирование числовых значений, ограничение дробной части
 * - Валидация: проверка лимитов, адреса кошелька, telegram ника
 * - Промокоды: применение скидок на комиссию (VAT)
 * - Поддержка Telegram Stars: специальная логика расчета с целыми числами
 * - Автопересчет: при изменении одного поля автоматически пересчитывается второе
 *
 * @workflow
 * 1. Пользователь вводит сумму в поле "Сумма" или "Вы получите"
 * 2. Происходит автоматический пересчет второго поля с учетом:
 *    - Текущего курса криптовалюты
 *    - Комиссии (VAT) из store
 *    - Factor (динамический коэффициент)
 *    - Примененного промокода (если есть)
 * 3. Валидируются все поля формы
 * 4. При нажатии кнопки создается транзакция в Firebase
 * 5. Данные сохраняются в localStorage для отслеживания
 *
 * @important
 * - Использует флаги isUpdatingFromSend/isUpdatingFromReceived для предотвращения циклических обновлений
 * - calculateFactor() должен получать сумму в фиатной валюте (RUB), а не количество крипты
 * - При применении промокода VAT изменяется в store, что триггерит пересчет всех зависимых значений
 */
import AppButton from "~/components/App/AppButton.vue";
import AppInput from "~/components/App/AppInput.vue";
import AppSelector from "~/components/App/AppSelector.vue";
import { computed, type ComputedRef, reactive, nextTick } from "vue";
import type { IPrices } from "~/types/pages/exchangerTypes";
import { translates } from "~/helpers/i18n";
import { usdtNet } from "~/components/Exchanger/consts";

import AppBackButton from "~/components/App/AppBackButton.vue";
import { Setter } from "~/helpers/setter";
import type { CryptoKeys, IActiveTransaction } from "~/stores/exchangerTypes";
import { storeToRefs } from "pinia";
import { useExchangerStore } from "~/stores/exchanger";
import { useFactor } from "~/composables/exchanger/useFactor";
import { useExchangerSettings } from "~/composables/exchanger/useExchanger";
import type { IModel } from "~/components/Exchanger/types";
import { useValidationByRules } from "~/composables/exchanger/useValidationByRules";
import { calculateExpirationTime } from "~/components/Exchanger/helpers/exchanger";
import { sendNotification } from "~/components/Exchanger/helpers/notificationSender";
import { checkTonAddress, checkTronAddress } from "~/api/checkAddress";
import { useGetter } from "~/composables/useGetter";

const emit = defineEmits<{
  (e: "back"): void;
}>();

const {
  vats,
  exchangerSettings,
  minmaxLimit,
  priceUsd,
  isTonForBuy,
  pricesList,
  time,
  selectedBuy,
  selectedSell,
  isStarsBuy,
  isTonForSell,
  isCryptoForSell,
  isSelectedBothItem,
  vatsInitial,
  activeTransaction,
} = storeToRefs(useExchangerStore());

/**
 * Модель данных формы обмена
 * @property {string} net - Выбранная сеть (TON/TRC20 для USDT)
 * @property {number} count - Количество криптовалюты для обмена
 * @property {string} telegram - Телеграм ник пользователя
 * @property {string} address - Адрес кошелька для получения криптовалюты
 * @property {Function} reset - Метод для сброса формы
 */
const model = reactive<IModel>({
  net: "",
  count: 1,
  telegram: "",
  address: "",
  reset: function () {
    this.address = "";
    this.count = 1;
  },
});

/**
 * Флаги для предотвращения циклических обновлений между инпутами
 * @description Когда пользователь вводит во второй инпут, первый не должен триггерить обновление второго и наоборот
 */
const isUpdatingFromReceived = ref<boolean>(false);
const isUpdatingFromSend = ref<boolean>(false);

/**
 * Значение поля "Вы получите" (отображаемое значение)
 */
const receivedAmountInput = ref<string>("0");

/**
 * Последнее числовое значение поля "Вы получите" для предотвращения лишних пересчетов
 */
const lastReceivedNumericValue = ref<number>(0);

/**
 * Флаг взаимодействия пользователя с инпутами (для показа ошибок валидации)
 */
const isUserInteracted = ref<boolean>(false);

/**
 * Сырое значение поля "Сумма" (для внутренних нужд)
 */
const sumInputRaw = ref<string>("1");

/**
 * Промокод: введенное значение
 */
const promocode = ref<string>("");

/**
 * Промокод: настройки из базы данных (пара валют, сумма, VAT, статус)
 */
const promocodeSettings = ref<Record<string, any> | null>(null);

/**
 * Промокод: текст ошибки валидации
 */
const promocodeError = ref<string>("");

/**
 * Промокод: флаг успешного применения
 */
const promoApplied = ref<boolean>(false);

/**
 * Валидация промокода и установка сообщения об ошибке
 * @returns {boolean|undefined} true если промокод валиден, undefined если есть ошибки
 * @description Проверяет:
 * - Существование промокода
 * - Статус использования (isPending, isUsed)
 * - Соответствие пары валют
 * - Соответствие суммы обмена
 */
const setErrorPromocode = () => {
  if (!promocodeSettings.value) {
    promocodeError.value = "Промокода не существует";
    return;
  }
  if (!promocode.value) {
    promocodeError.value = "";
    return;
  }
  if (promocodeSettings.value.isPending) {
    promocodeError.value =
      "Прямо сейчас промокодом пользуется другой пользователь";
    return;
  }
  if (promocodeSettings.value.isUsed) {
    promocodeError.value = "Уже использован";
    return;
  }
  if (
    +model.count !== promocodeSettings.value.sum ||
    `${selectedSell.value.key}/${selectedBuy.value.key}` !==
      promocodeSettings.value.pair
  ) {
    promocodeError.value = `Промокод доступен для пары ${promocodeSettings.value.pair} на сумму ${promocodeSettings.value.sum} ${isCryptoForSell.value ? selectedSell.value.key?.toUpperCase() : "RUB"} `;
    return;
  }

  return true;
};

watch(promocode, () => {
  promocodeError.value = "";
});

const {
  netModel,
  placeholderAddress,
  calculateItem,
  isNetShow,
  sumLabel,
  prices,
} = useExchangerSettings(model);

const { v$ } = useValidationByRules(model);

const { factor, calculateFactor } = useFactor(model);
const isOKAddress = shallowRef(false);
const isAddressChecked = shallowRef(false);

/**
 * Проверка возможности создания заявки
 * @returns {boolean} true если все поля валидны
 */
const enabledButton = computed(
  () => !v$.value.$errors.length && isCountValid.value && model.telegram,
);

/**
 * Проверка суммы обмена на соответствие лимитам
 * @returns {boolean} true если сумма в пределах min/max
 * @description Разная логика для:
 * - Покупки Telegram Stars
 * - Продажи криптовалюты (isCryptoForSell)
 * - Покупки криптовалюты
 */
const isCountValid = computed(() => {
  // ВАЖНО: Читаем все реактивные зависимости ДО условий, чтобы Vue отслеживал их
  const receivedValue =
    parseFloat(receivedAmountInput.value.replace(/\s/g, "")) || 0;
  const currentCount = model.count;

  // Проверка на наличие выбранных валют
  if (!selectedSell.value?.key || !selectedBuy.value?.key) {
    return true; // Не показываем ошибку, если валюты не выбраны
  }

  const cryptoPrice = prices.value[selectedSell.value.key as CryptoKeys];

  if (isStarsBuy.value && isTonForSell.value) {
    const tonCount = currentCount * cryptoPrice;
    const starsLimit = minmaxLimit.value?.["stars"];

    if (!starsLimit) return true;

    return tonCount >= starsLimit.min && tonCount <= starsLimit.max;
  }

  // Для продажи крипты: проверяем рубли (второй инпут)
  // Для покупки крипты: проверяем рубли (первый инпут)
  const valueToCheck = isCryptoForSell.value
    ? receivedValue // Берем введенное значение из второго инпута
    : currentCount; // Первый инпут (рубли)

  if (isCryptoForSell.value) {
    // Продаем крипту -> получаем рубли: проверяем лимиты по криптовалюте (в рублях)
    const limits = minmaxLimit.value?.[selectedSell.value.key];
    if (!limits) return true;

    return valueToCheck >= limits.min && valueToCheck <= limits.max;
  }

  // Покупаем крипту -> отдаем рубли: проверяем лимиты по криптовалюте (в рублях)
  const limits = minmaxLimit.value?.[selectedBuy.value.key];
  if (!limits) return true;

  return valueToCheck >= limits.min && valueToCheck <= limits.max;
});

/**
 * Полная валидация количества
 * @returns {boolean} true если count > 0 и в пределах лимитов
 */
const countValidate = computed(() => {
  const receivedValue =
    parseFloat(receivedAmountInput.value.replace(/\s/g, "")) || 0;
  const hasValue = model.count > 0 || receivedValue > 0;
  return hasValue && isCountValid.value;
});

/**
 * Цены криптовалют с учетом комиссии (VAT * factor)
 * @returns {IPrices} Объект с ценами для ton, not, usdt
 */
const withVat = computed<IPrices>(() => ({
  ton: prices.value.ton * factor.value,
  not: prices.value.not * factor.value,
  usdt: prices.value.usdt * factor.value,
}));

/**
 * Расчет суммы "Вы получите" на основе введенного количества
 * @returns {number} Сумма в выбранной валюте
 * @description Разные формулы для:
 * - Telegram Stars: использует starsRate и цену USDT
 * - Продажа крипты: count * price * (1 + VAT/100)
 * - Покупка крипты: count / (price * (1 + VAT/100))
 */
const calculateAmount: ComputedRef<number> = computed(() => {
  if (!prices.value?.usdt) return 0;
  const starsRate = exchangerSettings.value?.starsRate || 0.65;

  if (isStarsBuy.value) {
    const symbolPrice =
      pricesList.value.find(
        (item) =>
          item.symbol === `${selectedSell.value?.key?.toUpperCase()}USDT`,
      )?.price || 0;

    return isTonForSell.value
      ? +((model.count * symbolPrice) / starsRate).toFixed(0)
      : Math.floor(model.count / priceUsd.value / starsRate);
  }

  if (!selectedSell.value?.key || !selectedBuy.value?.key) return 0;

  const keyForVat: CryptoKeys = isCryptoForSell.value
    ? (selectedSell.value?.key as CryptoKeys)
    : (selectedBuy.value?.key as CryptoKeys);
  const vatValue = withVat.value[keyForVat] || 1;

  return isCryptoForSell.value
    ? +(model.count * vatValue).toFixed(2)
    : +(model.count / vatValue).toFixed(
        selectedBuy.value?.key === "btc" ? 6 : 2,
      );
});

/**
 * Очистка ввода - удаляет все кроме цифр и точки, применяет базовую валидацию
 * @param {string} value - Исходное значение
 * @param {boolean} isInteger - Флаг целого числа (для Stars)
 * @returns {string} Очищенное значение без форматирования
 */
const cleanMoneyInput = (value: string, isInteger: boolean = false): string => {
  if (!value) return "";

  // Удаляем все символы кроме цифр и точки (включая пробелы)
  let cleaned = value.replace(/[^0-9.]/g, "");

  // Запрещаем начинать с 0, кроме случая "0."
  if (
    cleaned.startsWith("0") &&
    cleaned.length > 1 &&
    !cleaned.startsWith("0.")
  ) {
    cleaned = cleaned.replace(/^0+/, "");
  }

  // Для целых чисел (STAR) - убираем точку
  if (isInteger) {
    cleaned = cleaned.replace(/\./g, "");
  } else {
    // Оставляем только первую точку
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Ограничиваем количество знаков после запятой до 8
    if (parts.length === 2 && parts[1].length > 8) {
      cleaned = parts[0] + "." + parts[1].substring(0, 8);
    }
  }

  return cleaned;
};

/**
 * Форматирует число с тысячными разделителями (пробелами)
 * @param {string|number} value - Число для форматирования
 * @returns {string} Отформатированное число
 * @example formatWithSpaces('1234567.89') => '1 234 567.89'
 */
const formatWithSpaces = (value: string | number): string => {
  if (!value && value !== 0) return "";

  const strValue = String(value);
  const parts = strValue.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Добавляем пробелы к целой части (справа налево)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Собираем результат
  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
};

/**
 * Удаляет пробелы из строки (для преобразования обратно в число)
 */
const removeThousandSeparators = (value: string): string => {
  return value.replace(/\s/g, "");
};

/**
 * Computed-свойство для инпута "Сумма"
 * @description get: возвращает отформатированное значение с пробелами
 * @description set: очищает и сохраняет как число
 */
const sumInputModel = computed({
  get: () => {
    const numValue = v$.value.count.$model || 0;
    if (numValue === 0) return "";
    return formatWithSpaces(numValue);
  },
  set: (value: string) => {
    const cleaned = cleanMoneyInput(value, false);
    const numValue = cleaned ? parseFloat(cleaned) : 0;
    v$.value.count.$model = numValue;
  },
});

/**
 * Computed-свойство для инпута "Вы получите"
 * @description get: возвращает отформатированное значение
 * @description set: просто обновляет значение (форматирование в handleReceivedInput)
 */
const receivedInputModel = computed({
  get: () => {
    return receivedAmountInput.value;
  },
  set: (value: string) => {
    // Просто сохраняем значение, форматирование происходит в handleReceivedInput
    receivedAmountInput.value = value;
  },
});

/**
 * Обработчик события input для поля "Сумма"
 */
const handleSumInput = (event: Event) => {
  isUserInteracted.value = true;
  const input = event.target as HTMLInputElement;
  const cursorPos = input.selectionStart || 0;
  const oldValue = input.value;

  // Очищаем ввод
  const cleaned = cleanMoneyInput(oldValue, false);

  // Считаем количество цифр до курсора (для восстановления позиции)
  const digitsBeforeCursor = oldValue
    .substring(0, cursorPos)
    .replace(/\D/g, "").length;

  // Форматируем с пробелами
  const formatted = formatWithSpaces(cleaned);

  if (formatted !== oldValue) {
    input.value = formatted;

    // Находим новую позицию курсора (после N цифр)
    let digitCount = 0;
    let newPos = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount >= digitsBeforeCursor) {
          newPos = i + 1;
          break;
        }
      }
    }

    if (digitCount < digitsBeforeCursor) {
      newPos = formatted.length;
    }

    nextTick(() => {
      input.setSelectionRange(newPos, newPos);
    });
  }

  const numValue = cleaned ? parseFloat(cleaned) : 0;
  v$.value.count.$model = numValue;
};

/**
 * Обработчик события input для поля "Вы получите"
 */
const handleReceivedInput = (event: Event) => {
  isUserInteracted.value = true;
  const input = event.target as HTMLInputElement;
  const cursorPos = input.selectionStart || 0;
  const oldValue = input.value;
  const isInteger = selectedBuy.value?.key === "stars";

  // Очищаем ввод
  const cleaned = cleanMoneyInput(oldValue, isInteger);

  // Считаем количество цифр до курсора
  const digitsBeforeCursor = oldValue
    .substring(0, cursorPos)
    .replace(/\D/g, "").length;

  // Форматируем с пробелами
  const formatted = formatWithSpaces(cleaned);

  if (formatted !== oldValue) {
    // Обновляем DOM напрямую
    input.value = formatted;

    // Находим новую позицию курсора (после N цифр)
    let digitCount = 0;
    let newPos = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount >= digitsBeforeCursor) {
          newPos = i + 1;
          break;
        }
      }
    }

    if (digitCount < digitsBeforeCursor) {
      newPos = formatted.length;
    }

    nextTick(() => {
      input.setSelectionRange(newPos, newPos);
    });
  }

  // Обновляем реактивное значение для watch (без повторного форматирования)
  receivedAmountInput.value = formatted;
};

/**
 * Обработчик вставки текста (Ctrl+V) для поля "Сумма"
 */
const handleSumPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  isUserInteracted.value = true;
  const pastedText = event.clipboardData?.getData("text") || "";
  const cleaned = cleanMoneyInput(pastedText, false);
  if (cleaned) {
    v$.value.count.$model = parseFloat(cleaned);
  }
};

/**
 * Обработчик вставки текста (Ctrl+V) для поля "Вы получите"
 */
const handleReceivedPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  isUserInteracted.value = true;
  const pastedText = event.clipboardData?.getData("text") || "";
  const isInteger = selectedBuy.value?.key === "stars";
  const cleaned = cleanMoneyInput(pastedText, isInteger);
  if (cleaned) {
    receivedAmountInput.value = formatWithSpaces(cleaned);
    // updateReceivedAmount вызывается через watch на receivedAmountInput
  }
};

/**
 * Обратный расчет: по сумме "Вы получите" пересчитываем "Сумму"
 * @param {string} value - Значение поля "Вы получите"
 * @description Рассчитывает model.count на основе:
 * - Stars: использует starsRate
 * - Продажа крипты: received / (price * (1 + VAT/100))
 * - Покупка крипты: received * (price * (1 + VAT/100))
 * @note Использует флаг isUpdatingFromReceived для предотвращения циклических обновлений
 */
const updateReceivedAmount = (value: string) => {
  if (isUpdatingFromReceived.value) return;

  isUpdatingFromReceived.value = true;

  const receivedValue =
    parseFloat(value.replace(/,/g, ".").replace(/\s/g, "")) || 0;

  if (
    !selectedSell.value?.key ||
    !selectedBuy.value?.key ||
    receivedValue === 0
  ) {
    nextTick(() => {
      isUpdatingFromReceived.value = false;
    });
    return;
  }

  const starsRate = exchangerSettings.value?.starsRate || 0.65;

  if (isStarsBuy.value) {
    const symbolPrice =
      pricesList.value.find(
        (item) =>
          item.symbol === `${selectedSell.value?.key?.toUpperCase()}USDT`,
      )?.price || 0;

    if (isTonForSell.value) {
      model.count = +((receivedValue * starsRate) / symbolPrice).toFixed(2);
    } else {
      model.count = +(receivedValue * starsRate * priceUsd.value).toFixed(2);
    }
  } else {
    const keyForVat: CryptoKeys = isCryptoForSell.value
      ? (selectedSell.value?.key as CryptoKeys)
      : (selectedBuy.value?.key as CryptoKeys);

    if (isCryptoForSell.value) {
      // Продаем крипту → получаем рубли: receivedValue это рубли
      // Пересчитываем factor на основе суммы в рублях (для динамической комиссии)
      calculateFactor(receivedValue);

      // Теперь пересчитываем model.count с ОБНОВЛЕННЫМ factor
      const vatValue = withVat.value[keyForVat] || 1;
      model.count = +(receivedValue / vatValue).toFixed(
        selectedSell.value?.key === "btc" ? 6 : 2,
      );
    } else {
      // Покупаем крипту → отдаем рубли
      // Нужна итерация для точного расчета (factor зависит от rubAmount, rubAmount зависит от factor)

      // Первое приближение: рассчитываем примерную сумму в рублях
      let vatValue = withVat.value[keyForVat] || 1;
      let rubAmount = +(receivedValue * vatValue).toFixed(2);

      // Пересчитываем factor на основе первого приближения
      calculateFactor(rubAmount);

      // Второе приближение с обновленным factor
      vatValue = withVat.value[keyForVat] || 1;
      model.count = +(receivedValue * vatValue).toFixed(2);
    }
  }

  nextTick(() => {
    isUpdatingFromReceived.value = false;
  });
};

/**
 * Label для поля "Вы получите" с указанием валюты
 * @returns {string} Например: "Вы получите (RUB)"
 */
const receivedAmountLabel = computed<string>(
  () => `Вы получите ${calculateItem.value || ""}`,
);
/**
 * Текст с информацией об экономии при использовании промокода
 * @returns {string} HTML строка с процентом экономии и суммой
 * @example "Пониженная комиссия: 2%! <br> Ваша экономия: 105 RUB"
 */
const yourEconomyWithPromoText = computed<string>(() => {
  const percentEconomy =
    +vatsInitial.value[selectedSell.value?.key].VAT_SMALL -
      +vats.value[selectedSell.value?.key].VAT_SMALL || 1;
  return (
    promocodeSettings.value &&
    `Пониженная комиссия: ${promocodeSettings.value.vat}%! <br> Ваша экономия: ${new Intl.NumberFormat("ru-RU").format(calculateAmount.value * (percentEconomy / 100))} ${calculateItem.value}`
  );
});
/**
 * Определение текущей сети для адреса кошелька
 * @returns {string|undefined} "TON" или "TRC20"
 */
const currentAddressNet = computed(() => {
  if (isTonForBuy.value || model.net === "ton") return "TON";
  if (model.net === "trc20") return "TRC20";
});
watch(
  () => model.count,
  () => {
    if (promocodeError.value) {
      promocodeError.value = "";
    }
    promoApplied.value && resetVats();
    if (isCryptoForSell.value) {
      calculateFactor(calculateAmount.value);
    } else {
      calculateFactor(model.count);
    }

    // Обновляем второй инпут только если изменение не пришло от него самого
    if (!isUpdatingFromReceived.value) {
      isUpdatingFromSend.value = true;
      receivedAmountInput.value = formatWithSpaces(calculateAmount.value);
      nextTick(() => {
        isUpdatingFromSend.value = false;
      });
    }
  },
);

watch(receivedAmountInput, (newValue) => {
  // Парсим новое значение
  const numericValue =
    parseFloat(newValue.replace(/,/g, ".").replace(/\s/g, "")) || 0;

  // Не обрабатываем изменения, если они пришли от первого инпута
  if (!isUpdatingFromSend.value) {
    // Пересчитываем только если числовое значение действительно изменилось
    if (numericValue !== lastReceivedNumericValue.value) {
      lastReceivedNumericValue.value = numericValue;
      updateReceivedAmount(newValue);
    }
  } else {
    // Обновляем lastReceivedNumericValue даже если изменение пришло от первого инпута
    lastReceivedNumericValue.value = numericValue;
  }
});
watch(
  () => [selectedSell.value, selectedBuy.value],
  () => {
    model.reset();
    removePromocode();
    isOKAddress.value = false;
    isAddressChecked.value = false;
    isUserInteracted.value = false;
  },
);
watch(
  () => model.address,
  async (address) => {
    if (!address) {
      isOKAddress.value = false;
      isAddressChecked.value = false;
    } else {
      if (currentAddressNet.value === "TON") {
        isOKAddress.value = await checkTonAddress(address);
        isAddressChecked.value = true;
      }
      if (currentAddressNet.value === "TRC20") {
        isOKAddress.value = await checkTronAddress(model.address);
        isAddressChecked.value = true;
      }
    }
  },
);
watch(
  () => model.net,
  async (net) => {
    isAddressChecked.value = false;
    if (!model.address) return;
    if (net === "ton" && model.address) {
      isOKAddress.value = await checkTonAddress(model.address);
      isAddressChecked.value = true;
    } else if (net === "trc20") {
      isOKAddress.value = await checkTronAddress(model.address);
      isAddressChecked.value = true;
    }
  },
);
onMounted(() => {
  calculateFactor(calculateAmount.value);
  receivedAmountInput.value = formatWithSpaces(
    calculateAmount.value.toString(),
  );
});

/**
 * Валидация формы перед отправкой
 * @description Запускает vuelidate валидацию, при успехе вызывает sendForm()
 */
const validateForm = async () => {
  const isValid = await v$.value.$validate();
  if (isValid) {
    await sendForm();
  }
};

/**
 * Отправка формы в базу данных
 * @description Выполняет:
 * 1. Создает payload с данными транзакции
 * 2. Сохраняет транзакцию в Firebase
 * 3. Отмечает промокод как isPending (если применен)
 * 4. Отправляет уведомление (в production)
 * 5. Сохраняет данные в localStorage
 */
const sendForm = async () => {
  const payload = createPayload();
  const expirationTime = calculateExpirationTime();

  try {
    await Setter.pushToDb("transactions", payload).then((data) => {
      handleTransactionSuccess(data, payload, expirationTime);
    });

    if (promoApplied.value) {
      await Setter.updateToDb({
        [`exchangerPromocodes/${promocode.value}/isPending`]: true,
      });
    }
    if (!process.dev) sendNotification(payload);
  } catch (err) {
    console.error("Ошибка при отправке формы:", err);
  }
};

/**
 * Создание объекта транзакции для отправки в базу данных
 * @returns {IActiveTransaction} Объект с данными транзакции
 */
const createPayload = (): IActiveTransaction => ({
  sell: selectedSell.value?.key,
  buy: selectedBuy.value?.key,
  countSell: model.count,
  countBuy: calculateAmount.value,
  address: model.address,
  id: +new Date(),
  factor: factor.value,
  net: model.net,
  telegram: model.telegram.startsWith("@")
    ? model.telegram.slice(1)
    : model.telegram,
  status: "created",
  promocode: promocode.value,
});

/**
 * Применение промокода
 * @description Выполняет:
 * 1. Загружает настройки промокода из базы данных
 * 2. Валидирует промокод (setErrorPromocode)
 * 3. При успехе применяет новый VAT (usePromo)
 */
const applyPromocode = async () => {
  const { getByKey } = useGetter();
  const promocodeObject = await getByKey(
    "exchangerPromocodes",
    promocode.value,
  );
  promocodeSettings.value = promocodeObject;
  const isError = setErrorPromocode();
  if (!isError) return;
  promoApplied.value = true;
  usePromo();
};
/**
 * Удаление примененного промокода
 * @description Выполняет:
 * 1. Восстанавливает исходные VAT (resetVats)
 * 2. Очищает настройки промокода
 * 3. Пересчитывает сумму "Вы получите"
 */
const removePromocode = () => {
  resetVats();
  promocodeSettings.value = null;
  promoApplied.value = false;

  // Обновляем поле "Вы получите" после удаления промокода
  nextTick(() => {
    isUpdatingFromSend.value = true;
    receivedAmountInput.value = formatWithSpaces(
      calculateAmount.value.toString(),
    );
    nextTick(() => {
      isUpdatingFromSend.value = false;
    });
  });
};
/**
 * Применение нового VAT из промокода
 * @description Выполняет:
 * 1. Изменяет VAT_BIG и VAT_SMALL в store
 * 2. Пересчитывает factor через calculateFactor(calculateAmount)
 * 3. Обновляет поле "Вы получите" с новым расчетом
 * @important Передает calculateAmount.value в calculateFactor() для правильного расчета factor
 */
const usePromo = () => {
  const [sellValute] = promocodeSettings.value.pair.split("/");
  vats.value[sellValute].VAT_BIG = promocodeSettings.value.vat;
  vats.value[sellValute].VAT_SMALL = promocodeSettings.value.vat;

  calculateFactor(calculateAmount.value);

  // Обновляем поле "Вы получите" после применения промокода
  nextTick(() => {
    isUpdatingFromSend.value = true;
    receivedAmountInput.value = formatWithSpaces(
      calculateAmount.value.toString(),
    );
    nextTick(() => {
      isUpdatingFromSend.value = false;
    });
  });
};
/**
 * Восстановление исходных значений VAT после удаления промокода
 * @description Восстанавливает VAT_BIG и VAT_SMALL из vatsInitial, пересчитывает factor
 */
const resetVats = () => {
  if (!promocodeSettings.value) return;
  const [sellValute] = promocodeSettings.value.pair.split("/");
  vats.value[sellValute].VAT_BIG = vatsInitial.value[sellValute].VAT_BIG;
  vats.value[sellValute].VAT_SMALL = vatsInitial.value[sellValute].VAT_SMALL;
  calculateFactor(calculateAmount.value);
};
/**
 * Обработка успешного создания транзакции
 * @param {Record<string, any>} data - Данные ответа от Firebase (содержит key транзакции)
 * @param {IActiveTransaction} payload - Объект транзакции
 * @param {Date} expirationTime - Время истечения заявки
 * @description Сохраняет транзакцию и время в localStorage, обновляет store
 */
const handleTransactionSuccess = (
  data: Record<string, any>,
  payload: IActiveTransaction,
  expirationTime: Date,
) => {
  const transactionData = {
    ...payload,
    key: data.key,
  };

  window.localStorage.setItem("transaction", JSON.stringify(transactionData));
  window.localStorage.setItem("expTime", expirationTime.toString());

  time.value = expirationTime;
  activeTransaction.value = transactionData;
};
</script>
<style lang="scss" scoped>
@import "../../style/exchanger/rightExchangerBlock.scss";
</style>

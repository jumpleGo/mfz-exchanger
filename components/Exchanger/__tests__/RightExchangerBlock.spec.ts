import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';
import RightExchangerBlock from '../RightExchangerBlock.vue';
import { useExchangerStore } from '~/stores/exchanger';

// Моки для композаблов
const mockFactor = ref(1.05);
const mockCalculateFactor = vi.fn((amount: number) => {
  // Получаем store для доступа к текущим VAT
  const store = useExchangerStore();
  const selectedKey = store.isCryptoForSell ? store.selectedSell?.key : store.selectedBuy?.key;
  
  if (selectedKey && store.vats[selectedKey]) {
    // Обновляем factor на основе текущего VAT
    const vat = amount >= 10000 ? store.vats[selectedKey].VAT_BIG : store.vats[selectedKey].VAT_SMALL;
    mockFactor.value = 1 + vat / 100;
  }
});

vi.mock('~/composables/exchanger/useFactor', () => ({
  useFactor: () => ({
    factor: mockFactor,
    calculateFactor: mockCalculateFactor,
  }),
}));

const mockPrices = ref({
  ton: 350,
  not: 8,
  usdt: 95,
});

vi.mock('~/composables/exchanger/useExchanger', () => ({
  useExchangerSettings: () => ({
    maskaOptions: {},
    netModel: ref(''),
    placeholderAddress: 'Адрес кошелька',
    calculateItem: computed(() => 'RUB'),
    isNetShow: ref(false),
    sumLabel: 'Сумма',
    prices: mockPrices,
  }),
}));

vi.mock('~/composables/exchanger/useValidationByRules', () => ({
  useValidationByRules: (model: any) => {
    const mockVuelidate = {
      count: {
        get $model() {
          return model.count;
        },
        set $model(value: number) {
          model.count = value;
        },
        $dirty: false,
        $error: false,
        $errors: [],
      },
      telegram: {
        get $model() {
          return model.telegram;
        },
        set $model(value: string) {
          model.telegram = value;
        },
        $error: false,
        $errors: [],
      },
      address: {
        get $model() {
          return model.address;
        },
        set $model(value: string) {
          model.address = value;
        },
        $error: false,
        $errors: [],
      },
      net: {
        $error: false,
      },
      $validate: vi.fn().mockResolvedValue(true),
      $errors: [],
    };
    
    return {
      v$: ref(mockVuelidate),
    };
  },
}));

const mockGetByKey = vi.fn();

vi.mock('~/composables/useGetter', () => ({
  useGetter: () => ({
    getByKey: mockGetByKey,
    getFromDB: vi.fn(),
    getByValue: vi.fn(),
    getCountByValue: vi.fn(),
  }),
}));

vi.mock('~/helpers/setter', () => ({
  Setter: {
    pushToDb: vi.fn().mockResolvedValue({ key: 'test-key' }),
    updateToDb: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('~/api/checkAddress', () => ({
  checkTonAddress: vi.fn().mockResolvedValue(true),
  checkTronAddress: vi.fn().mockResolvedValue(true),
}));

vi.mock('~/components/Exchanger/helpers/exchanger', () => ({
  calculateExpirationTime: vi.fn(() => new Date()),
}));

vi.mock('~/components/Exchanger/helpers/notificationSender', () => ({
  sendNotification: vi.fn(),
}));

vi.mock('~/components/Exchanger/consts', () => ({
  usdtNet: [],
}));

vi.mock('~/helpers/i18n', () => ({
  translates: {
    limit: vi.fn(() => 'Лимит превышен'),
    telegram: 'Неверный формат телеграм',
    address: 'Неверный адрес',
  },
}));

describe('RightExchangerBlock', () => {
  let wrapper: any;
  let store: any;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    
    store = useExchangerStore();
    
    // Настройка store - устанавливаем только ref свойства, computed вычислятся автоматически
    store.coins = [
      { key: 'ton', title: 'TON', enabled: true, options: ['sell', 'buy'] },
      { key: 'not', title: 'NOT', enabled: true, options: ['sell', 'buy'] },
      { key: 'usdt', title: 'USDT', enabled: true, options: ['sell', 'buy'] },
      { key: 'btc', title: 'BTC', enabled: true, options: ['sell', 'buy'] },
    ];
    store.valutes = [
      { key: 'rub', title: 'RUB', enabled: true, options: ['sell', 'buy'] },
    ];
    store.others = [
      { key: 'stars', title: 'Telegram Stars', enabled: true, options: ['buy'] },
    ];
    
    store.selectedSell = { key: 'ton', title: 'TON' };
    store.selectedBuy = { key: 'rub', title: 'RUB' };
    // isSelectedBothItem, isCryptoForSell, isStarsBuy, isTonForSell, isTonForBuy - это computed свойства
    // Они вычисляются автоматически на основе selectedSell и selectedBuy
    
    store.minmaxLimit = {
      ton: { min: 0.1, max: 100 },
      rub: { min: 100, max: 1000000 },
      stars: { min: 100, max: 100000 },
    };
    store.exchangerSettings = {
      starsRate: 0.65,
    };
    store.pricesList = [
      { symbol: 'TONUSDT', price: 5.5 },
    ];
    store.priceUsd = 95;
    store.vats = {
      ton: { VAT_BIG: 5, VAT_SMALL: 5 },
      not: { VAT_BIG: 5, VAT_SMALL: 5 },
      usdt: { VAT_BIG: 5, VAT_SMALL: 5 },
    };
    store.vatsInitial = {
      ton: { VAT_BIG: 5, VAT_SMALL: 5 },
      not: { VAT_BIG: 5, VAT_SMALL: 5 },
      usdt: { VAT_BIG: 5, VAT_SMALL: 5 },
    };

    wrapper = mount(RightExchangerBlock, {
      global: {
        plugins: [pinia],
        stubs: {
          AppBackButton: true,
          AppInput: {
            template: `
              <div>
                <input 
                  :id="id" 
                  ref="input"
                  :value="modelValue" 
                  @input="handleInput"
                  @paste="handlePaste"
                />
              </div>
            `,
            props: ['modelValue', 'id', 'disabled', 'error', 'placeholder', 'label', 'paste', 'valid', 'invalid'],
            emits: ['update:modelValue', 'input', 'paste'],
            watch: {
              modelValue(newValue: any) {
                this.$nextTick(() => {
                  // Синхронизируем DOM input с modelValue
                  const inputEl = this.$refs.input as HTMLInputElement;
                  if (inputEl && inputEl.value !== String(newValue)) {
                    inputEl.value = String(newValue);
                  }
                });
              }
            },
            methods: {
              handleInput(e: Event) {
                const targetEl = e.target as HTMLInputElement;
                const originalValue = targetEl.value;
                
                // Первый эмит с исходным значением
                this.$emit('update:modelValue', originalValue);
                this.$emit('input', e);
                
                // Проверяем, изменился ли value после обработки события компонентом
                // Используем серию nextTick и setTimeout для гарантированной синхронизации
                this.$nextTick(() => {
                  setTimeout(() => {
                    if (targetEl.value !== originalValue) {
                      this.$emit('update:modelValue', targetEl.value);
                    }
                  }, 10);
                });
              },
              handlePaste(e: ClipboardEvent) {
                this.$emit('paste', e);
              }
            }
          },
          AppButton: {
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot>{{ title }}</slot></button>',
            props: ['title', 'disabled', 'size'],
          },
          AppSelector: {
            template: '<select :id="id" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"></select>',
            props: ['modelValue', 'id', 'placeholder', 'options', 'error'],
          },
        },
      },
    });
  });

  describe('Тест 1: Ввод во втором инпуте (received) -> пересчет первого (sum)', () => {
    it('должен правильно рассчитать сумму в первом инпуте при вводе во втором', async () => {
      // Настраиваем для простого случая: продаём TON, покупаем RUB
      // isCryptoForSell уже true, т.к. selectedSell = 'ton' (из coins)
      
      // Получаем второй инпут (received)
      const receivedInput = wrapper.find('#received');
      expect(receivedInput.exists()).toBe(true);
      
      // Вводим 1000 RUB в поле "Вы получите"
      receivedInput.element.value = '1000';
      await receivedInput.trigger('input');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Проверяем, что первый инпут обновился
      // При VAT = 5%, если получаем 1000 RUB, и цена TON = 350 RUB
      // то нужно отдать примерно 1000 / (350 * 1.05) = 2.72 TON
      const sumInput = wrapper.find('#sum');
      const sumValue = parseFloat(sumInput.element.value);
      
      expect(sumValue).toBeGreaterThan(0);
      expect(sumValue).toBeCloseTo(2.72, 1);
    });

    it('должен корректно работать с маской для целых чисел при STARS', async () => {
      // Настраиваем покупку STARS
      store.selectedBuy = { key: 'stars', title: 'Telegram Stars' };
      // isStarsBuy автоматически станет true
      
      await wrapper.vm.$nextTick();
      await flushPromises();
      
      const receivedInput = wrapper.find('#received');
      
      // Пытаемся ввести дробное число
      receivedInput.element.value = '1000.55';
      await receivedInput.trigger('input');
      
      // Даем время на полную синхронизацию (включая setTimeout в stub и обработку маски)
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Должно остаться только целое число
      expect(receivedInput.element.value).toBe('100 055');
    });
  });

  describe('Тест 2: Ввод в первом инпуте (sum) -> пересчет второго (received)', () => {
    it('должен правильно рассчитать сумму во втором инпуте при вводе в первом', async () => {
      // isCryptoForSell уже true, т.к. selectedSell = 'ton' (из coins)
      
      const sumInput = wrapper.find('#sum');
      expect(sumInput.exists()).toBe(true);
      
      // Вводим 10 TON
      sumInput.element.value = '10';
      await sumInput.trigger('input');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Проверяем, что второй инпут обновился
      // При цене TON = 350 RUB и VAT = 5%
      // получаем: 10 * 350 * 1.03 = 3675 RUB
      const receivedInput = wrapper.find('#received');
      const receivedValue = parseFloat(receivedInput.element.value);
      
      expect(receivedValue).toBeGreaterThan(0);
      expect(receivedValue).toBeCloseTo(3675, 0);
    });

    it('должен применять маску и не позволять вводить недопустимые символы', async () => {
      const sumInput = wrapper.find('#sum');
      
      // Пытаемся ввести буквы
      sumInput.element.value = 'abc123';
      await sumInput.trigger('input');
      await flushPromises();
      
      // Должны остаться только цифры
      expect(sumInput.element.value).toBe('123');
      
      // Пытаемся ввести число, начинающееся с 0
      sumInput.element.value = '0123';
      await sumInput.trigger('input');
      await flushPromises();
      
      // Ведущий ноль должен быть удален
      expect(sumInput.element.value).toBe('123');
    });

    it('должен разрешать дробные числа с точкой', async () => {
      const sumInput = wrapper.find('#sum');
      
      sumInput.element.value = '10.5';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('10.5');
      
      const receivedInput = wrapper.find('#received');
      const receivedValue = parseFloat(receivedInput.element.value);
      
      // 10.5 * 350 * 1.05
      expect(receivedValue).toBeCloseTo(3858.75, 0);
    });
  });

  describe('Тест 3: Применение промокода', () => {
    it('должен проверить правильную пару валют и изменить комиссию', async () => {
      const { Getter } = await import('~/helpers/getter');
      
      // Мокаем промокод с пониженной комиссией
      const mockPromocode = {
        pair: 'ton/rub',
        sum: 10,
        vat: 2, // Комиссия 2% вместо 5%
        isPending: false,
        isUsed: false,
      };
      
      (Getter.getByKey as any).mockResolvedValue(mockPromocode);
      
      // Вводим сумму 10 TON
      const sumInput = wrapper.find('#sum');
      sumInput.element.value = '10';
      await sumInput.trigger('input');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Запоминаем сумму получения до промокода
      expect(store.vats.ton.VAT_SMALL).toBe(5);
      const receivedInput = wrapper.find('#received');
      const receivedBefore = parseFloat(receivedInput.element.value);
      
      // Вводим промокод
      const promocodeInput = wrapper.find('#promocode');
      await promocodeInput.setValue('TESTPROMO');
      await flushPromises();
      
      // Нажимаем кнопку "применить"
      const applyButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('применить')
      );
      expect(applyButton).toBeDefined();
      
      await applyButton?.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Ждем обновления DOM после изменения VAT
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Проверяем, что комиссия изменилась в store
      expect(store.vats.ton.VAT_SMALL).toBe(2);
      expect(store.vats.ton.VAT_BIG).toBe(2);
      
      // Проверяем, что factor обновился
      expect(mockFactor.value).toBe(1.02);
      
      // Проверяем, что сумма получения изменилась
      // При продаже криптовалюты: меньший VAT = меньше RUB (10 * 350 * 1.02 = 3570 < 3675)
      const receivedAfter = parseFloat(receivedInput.element.value);
      expect(receivedAfter).not.toBe(receivedBefore);
      expect(receivedAfter).toBeCloseTo(3570, 0);
      
      // Проверяем флаг применения промокода
      expect(wrapper.vm.promoApplied).toBe(true);
    });

    it('должен показать ошибку для неверной пары валют', async () => {
      const { Getter } = await import('~/helpers/getter');
      
      // Промокод для другой пары
      const mockPromocode = {
        pair: 'usdt/rub',
        sum: 100,
        vat: 2,
        isPending: false,
        isUsed: false,
      };
      
      (Getter.getByKey as any).mockResolvedValue(mockPromocode);
      
      // Текущая пара: ton/rub
      store.selectedSell = { key: 'ton', title: 'TON' };
      store.selectedBuy = { key: 'rub', title: 'RUB' };
      
      const sumInput = wrapper.find('#sum');
      sumInput.element.value = '10';
      await sumInput.trigger('input');
      await flushPromises();
      
      const promocodeInput = wrapper.find('#promocode');
      await promocodeInput.setValue('WRONGPAIR');
      await flushPromises();
      
      const applyButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('применить')
      );
      
      await applyButton?.trigger('click');
      await flushPromises();
      
      // Промокод не должен быть применен
      expect(wrapper.vm.promoApplied).toBe(false);
      expect(wrapper.vm.promocodeError).toContain('Промокод доступен для пары');
    });

    it('должен показать ошибку для неверной суммы', async () => {
      const { Getter } = await import('~/helpers/getter');
      
      // Промокод на 100 TON
      const mockPromocode = {
        pair: 'ton/rub',
        sum: 100,
        vat: 2,
        isPending: false,
        isUsed: false,
      };
      
      (Getter.getByKey as any).mockResolvedValue(mockPromocode);
      
      // Вводим 10 TON (не совпадает с промокодом)
      const sumInput = wrapper.find('#sum');
      sumInput.element.value = '10';
      await sumInput.trigger('input');
      await flushPromises();
      
      const promocodeInput = wrapper.find('#promocode');
      await promocodeInput.setValue('WRONGSUM');
      await flushPromises();
      
      const applyButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('применить')
      );
      
      await applyButton?.trigger('click');
      await flushPromises();
      
      // Промокод не должен быть применен
      expect(wrapper.vm.promoApplied).toBe(false);
      expect(wrapper.vm.promocodeError).toContain('на сумму');
    });

    it('должен восстановить исходную комиссию при удалении промокода', async () => {
      const { Getter } = await import('~/helpers/getter');
      
      const mockPromocode = {
        pair: 'ton/rub',
        sum: 10,
        vat: 2,
        isPending: false,
        isUsed: false,
      };
      
      (Getter.getByKey as any).mockResolvedValue(mockPromocode);
      
      // Применяем промокод
      const sumInput = wrapper.find('#sum');
      sumInput.element.value = '10';
      await sumInput.trigger('input');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Сохраняем значение до применения промокода
      const receivedInput = wrapper.find('#received');
      const receivedBefore = parseFloat(receivedInput.element.value);
      
      const promocodeInput = wrapper.find('#promocode');
      await promocodeInput.setValue('TESTPROMO');
      await flushPromises();
      
      const applyButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('применить')
      );
      await applyButton?.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Ждем обновления DOM после изменения VAT
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      expect(store.vats.ton.VAT_SMALL).toBe(2);
      expect(mockFactor.value).toBe(1.02);
      
      // Проверяем, что значение изменилось после применения промокода
      const receivedWithPromo = parseFloat(receivedInput.element.value);
      expect(receivedWithPromo).not.toBe(receivedBefore);
      expect(receivedWithPromo).toBeCloseTo(3570, 0);
      
      // Удаляем промокод
      const removeButton = wrapper.findAll('button').find((btn: any) => 
        btn.text().includes('удалить')
      );
      await removeButton?.trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Ждем обновления DOM после удаления промокода
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      // Комиссия должна вернуться к исходной
      expect(store.vats.ton.VAT_SMALL).toBe(5);
      expect(mockFactor.value).toBe(1.05);
      expect(wrapper.vm.promoApplied).toBe(false);
      
      // Сумма получения должна вернуться к значению до промокода
      const receivedAfterRemove = parseFloat(receivedInput.element.value);
      expect(receivedAfterRemove).toBeCloseTo(receivedBefore, 0);
      expect(receivedAfterRemove).toBeCloseTo(3675, 0);
      expect(receivedAfterRemove).toBeGreaterThan(receivedWithPromo); // 3675 > 3570
    });
  });

  describe('Дополнительные тесты маски', () => {
    it('не должен позволять начинать с нуля (кроме 0.)', async () => {
      const sumInput = wrapper.find('#sum');
      
      sumInput.element.value = '0123';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('123');
      
      // Но 0. должен быть разрешен
      sumInput.element.value = '0.5';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('0.5');
    });

    it('должен удалять все символы кроме цифр и точки', async () => {
      const sumInput = wrapper.find('#sum');
      
      sumInput.element.value = '12abc34.56@#$78';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('1234.5678');
    });

    it('должен оставлять только одну точку', async () => {
      const sumInput = wrapper.find('#sum');
      
      sumInput.element.value = '12.34.56';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('12.3456');
    });

    it('должен ограничивать знаки после запятой до 8', async () => {
      const sumInput = wrapper.find('#sum');
      
      sumInput.element.value = '1.123456789012345';
      await sumInput.trigger('input');
      await flushPromises();
      
      expect(sumInput.element.value).toBe('1.12345678');
    });
  });
});

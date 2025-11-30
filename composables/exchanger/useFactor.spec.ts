import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { IModel } from '~/components/Exchanger/types';
import { useFactor } from './useFactor';

// Получаем мок refs из глобального setup (создан в test/setup.ts)
const vatsRef = (global as any).__MOCK_STORE__.vats;
const isValuteForSellRef = (global as any).__MOCK_STORE__.isValuteForSell;
const selectedSellRef = (global as any).__MOCK_STORE__.selectedSell;
const selectedBuyRef = (global as any).__MOCK_STORE__.selectedBuy;

describe('useFactor', () => {
  let model: IModel;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    
    model = {
      net: '',
      count: 100,
      telegram: '',
      address: '',
      reset: vi.fn(),
    };
  });

  describe('Продажа криптовалюты (USDT → RUB)', () => {
    it('должен использовать VAT_BIG для суммы меньше 10000 RUB', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Сумма в рублях меньше 10000
      calculateFactor(9999);
      
      // factor = 1 - (VAT_BIG / 100) = 1 - (4 / 100) = 0.96
      expect(factor.value).toBe(0.96);
    });

    it('должен использовать VAT_SMALL для суммы 10000 RUB и выше', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Сумма в рублях >= 10000
      calculateFactor(10000);
      
      // factor = 1 - (VAT_SMALL / 100) = 1 - (2 / 100) = 0.98
      expect(factor.value).toBe(0.98);
    });

    it('должен использовать VAT_SMALL для большой суммы', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Большая сумма
      calculateFactor(20000);
      
      // factor = 1 - (VAT_SMALL / 100) = 1 - (2 / 100) = 0.98
      expect(factor.value).toBe(0.98);
    });
  });

  describe('Покупка криптовалюты (RUB → USDT)', () => {
    beforeEach(() => {
      isValuteForSellRef.value = true;
      selectedSellRef.value = { key: 'rub' };
      selectedBuyRef.value = { key: 'usdt' };
    });

    it('должен использовать VAT_BIG для суммы меньше 10000 RUB', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Сумма в рублях меньше 3000
      calculateFactor(9999);
      
      // factor = 1 + (VAT_BIG / 100) = 1 + (4 / 100) = 1.04
      expect(factor.value).toBe(1.04);
    });

    it('должен использовать VAT_SMALL для суммы 10000 RUB и выше', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Сумма в рублях >= 3000
      calculateFactor(10000);
      
      // factor = 1 + (VAT_SMALL / 100) = 1 + (2 / 100) = 1.02
      expect(factor.value).toBe(1.02);
    });

    it('должен использовать VAT_SMALL для большой суммы', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Большая сумма
      calculateFactor(10000);
      
      // factor = 1 + (VAT_SMALL / 100) = 1 + (2 / 100) = 1.02
      expect(factor.value).toBe(1.02);
    });
  });

  describe('Граничные случаи', () => {
      beforeEach(() => {
          isValuteForSellRef.value = false;
          selectedSellRef.value = { key: 'usdt' };
          selectedBuyRef.value = { key: 'rub' };
      });

    it('должен правильно обрабатывать порог 10000', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Ровно 9999 - должен быть VAT_BIG
      calculateFactor(9999);
      expect(factor.value).toBe(0.96);
      
      // Ровно 10000 - должен быть VAT_SMALL
      calculateFactor(10000);
      expect(factor.value).toBe(0.98);
      
      // Чуть больше 10001 - должен быть VAT_SMALL
      calculateFactor(10001);
      expect(factor.value).toBe(0.98);
    });

    it('должен обрабатывать нулевую сумму', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      calculateFactor(0);
      
      // 0 < 10000, используем VAT_BIG
      expect(factor.value).toBe(0.96);
    });

    it('должен обрабатывать отрицательную сумму', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      calculateFactor(-100);
      
      // -100 < 10000, используем VAT_BIG
      expect(factor.value).toBe(0.96);
    });
  });

  describe('Динамическое обновление factor', () => {
    it('должен обновлять factor при изменении суммы с малой на большую', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Начальная малая сумма
      calculateFactor(1000);
      expect(factor.value).toBe(0.96); // VAT_BIG
      
      // Обновляем на большую сумму
      calculateFactor(10000);
      expect(factor.value).toBe(0.98); // VAT_SMALL
    });

    it('должен обновлять factor при изменении суммы с большой на малую', () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Начальная большая сумма
      calculateFactor(11000);
      expect(factor.value).toBe(0.98); // VAT_SMALL
      
      // Обновляем на малую сумму
      calculateFactor(1000);
      expect(factor.value).toBe(0.96); // VAT_BIG
    });
  });
});

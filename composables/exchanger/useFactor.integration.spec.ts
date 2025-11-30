import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { IModel } from '~/components/Exchanger/types';
import { useFactor } from './useFactor';

/**
 * Интеграционный тест для проверки бага:
 * "При вводе большой суммы в поле 'Вы получите' курс улучшается,
 * но при стирании до малой суммы комиссия не меняется обратно"
 */

// Получаем мок refs из глобального setup (создан в test/setup.ts)
const vatsRef = (global as any).__MOCK_STORE__.vats;
const isValuteForSellRef = (global as any).__MOCK_STORE__.isValuteForSell;
const selectedSellRef = (global as any).__MOCK_STORE__.selectedSell;
const selectedBuyRef = (global as any).__MOCK_STORE__.selectedBuy;

describe('useFactor - интеграционный тест обратного расчета', () => {
  let model: IModel;

  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Сбрасываем значения перед каждым тестом
    isValuteForSellRef.value = true; // RUB → USDT
    selectedSellRef.value = { key: 'rub' };
    selectedBuyRef.value = { key: 'usdt' };
    
    model = {
      net: '',
      count: 0,
      telegram: '',
      address: '',
      reset: vi.fn(),
    };
  });

  describe('Сценарий: Покупка USDT за RUB', () => {
    it('должен правильно пересчитывать factor при изменении суммы от малой к большой и обратно', async () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Шаг 1: Пользователь вводит малую сумму (1000 RUB)
      calculateFactor(1000);
      expect(factor.value).toBe(1.04); // 1 + (4 / 100) - VAT_BIG для малых сумм
      
      // Шаг 2: Пользователь вводит большую сумму (5000 RUB)
      calculateFactor(11000);
      expect(factor.value).toBe(1.02); // 1 + (2 / 100) - VAT_SMALL для больших сумм
      
      // Шаг 3: Пользователь стирает до малой суммы (500 RUB)
      // БАГ БЫЛ ЗДЕСЬ: factor оставался 1.02 вместо возврата к 1.04
      calculateFactor(500);
      expect(factor.value).toBe(1.04); // Должен вернуться к VAT_BIG
    });

    it('должен точно определять порог переключения комиссии', async () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // 2999 RUB - последнее значение с высокой комиссией
      calculateFactor(9999);
      expect(factor.value).toBe(1.04);
      
      // 3000 RUB - первое значение с низкой комиссией
      calculateFactor(10000);
      expect(factor.value).toBe(1.02);
      
      // Возврат к 2999 - должна вернуться высокая комиссия
      calculateFactor(9999);
      expect(factor.value).toBe(1.04);
    });
  });

  describe('Сценарий: Продажа USDT за RUB', () => {
    beforeEach(() => {
      isValuteForSellRef.value = false; // USDT → RUB
      selectedSellRef.value = { key: 'usdt' };
      selectedBuyRef.value = { key: 'rub' };
    });

    it('должен правильно пересчитывать factor при изменении суммы в обе стороны', async () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Малая сумма RUB
      calculateFactor(1000);
      expect(factor.value).toBe(0.96); // 1 - (4 / 100) - VAT_BIG
      
      // Большая сумма RUB
      calculateFactor(15000);
      expect(factor.value).toBe(0.98); // 1 - (2 / 100) - VAT_SMALL
      
      // Возврат к малой сумме
      calculateFactor(1000);
      expect(factor.value).toBe(0.96); // Должен вернуться к VAT_BIG
    });
  });

  describe('Сценарий: Имитация реального ввода пользователя', () => {
    it('должен правильно обрабатывать последовательный ввод цифр', async () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Пользователь вводит "5"
      calculateFactor(5);
      expect(factor.value).toBe(1.04); // VAT_BIG
      
      // Пользователь вводит "50"
      calculateFactor(50);
      expect(factor.value).toBe(1.04); // VAT_BIG
      
      // Пользователь вводит "500"
      calculateFactor(500);
      expect(factor.value).toBe(1.04); // VAT_BIG
      
      // Пользователь вводит "5000"
      calculateFactor(10000);
      expect(factor.value).toBe(1.02); // VAT_SMALL - порог пройден!
      
      // Пользователь нажимает backspace несколько раз: "500"
      calculateFactor(500);
      expect(factor.value).toBe(1.04); // Должен вернуться к VAT_BIG
    });

    it('должен обрабатывать очистку поля', async () => {
      const { factor, calculateFactor } = useFactor(model);
      
      // Большая сумма
      calculateFactor(20000);
      expect(factor.value).toBe(1.02);
      
      // Очистка поля (0)
      calculateFactor(0);
      expect(factor.value).toBe(1.04); // 0 < 3000, используем VAT_BIG
    });
  });

  describe('Проверка формулы расчета с различными VAT', () => {
    it('должен правильно рассчитывать factor для TON', async () => {
      selectedBuyRef.value = { key: 'ton' };
      
      const { factor, calculateFactor } = useFactor(model);
      
      // VAT_BIG для TON = 5
      calculateFactor(1000);
      expect(factor.value).toBe(1.05); // 1 + (5 / 100)
      
      // VAT_SMALL для TON = 3
      calculateFactor(10000);
      expect(factor.value).toBe(1.03); // 1 + (3 / 100)
    });
  });
});

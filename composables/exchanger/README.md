# Тесты для useFactor

## Описание

Тесты для функции `useFactor`, которая рассчитывает динамический коэффициент комиссии (factor) в зависимости от суммы обмена.

## Исправленный баг

**Проблема:** При вводе большой суммы в поле "Вы получите" курс улучшался (комиссия снижалась), но при стирании до малой суммы комиссия не возвращалась к исходному значению.

**Причина:** В функции `calculateFactor` для покупки криптовалюты (RUB → USDT) использовался `model.count` вместо переданного параметра `calculateAmount`.

**Исправление:** Заменили `+model.count < 3000` на `calculateAmount < 3000` в файле `useFactor.ts` строка 15.

## Структура тестов

### 1. `useFactor.spec.ts` - Юнит-тесты
Проверяет корректность расчета factor в различных сценариях:
- Продажа криптовалюты (USDT → RUB)
- Покупка криптовалюты (RUB → USDT)
- Граничные случаи (порог 3000 RUB)
- Динамическое обновление factor

### 2. `useFactor.integration.spec.ts` - Интеграционные тесты
Проверяет реальные сценарии использования:
- Ввод большой суммы → уменьшение до малой
- Последовательный ввод цифр
- Очистка поля
- Работа с разными токенами (USDT, TON)

## Технические детали

### Мокирование store с глобальным setup

Для корректной работы моков используется глобальный `__MOCK_STORE__` и глобальная функция `useExchangerStore`, которые создаются в `test/setup.ts`:

```typescript
// В test/setup.ts
(global as any).__MOCK_STORE__ = {
  vats: vueRef({
    usdt: { VAT_BIG: 4, VAT_SMALL: 2 },
    ton: { VAT_BIG: 5, VAT_SMALL: 3 },
    not: { VAT_BIG: 5, VAT_SMALL: 3 },
  }),
  isValuteForSell: vueRef(false),
  selectedSell: vueRef({ key: 'usdt' }),
  selectedBuy: vueRef({ key: 'rub' }),
};

// Создаем глобальную мок-функцию
(global as any).useExchangerStore = vi.fn(() => (global as any).__MOCK_STORE__);
```

```typescript
// В useFactor.ts - проверка на тестовое окружение
const store = (global as any).useExchangerStore 
  ? (global as any).useExchangerStore() 
  : importedUseExchangerStore();
```

```typescript
// В тестах - просто импортируем и используем
import { useFactor } from './useFactor';

const vatsRef = (global as any).__MOCK_STORE__.vats;
const isValuteForSellRef = (global as any).__MOCK_STORE__.isValuteForSell;
```

**Преимущества:**
- ✅ Не нужен `vi.mock()` в каждом тесте
- ✅ Мок автоматически применяется ко всем тестам
- ✅ Можно изменять значения refs в `beforeEach()`
- ✅ Простой и понятный код

### Изменение значений store в тестах

```typescript
beforeEach(() => {
  // Меняем состояние store для теста
  isValuteForSellRef.value = true;
  selectedBuyRef.value = { key: 'usdt' };
});
```

## Запуск тестов

```bash
# Запустить все тесты useFactor
npx vitest run useFactor

# Запустить в watch режиме
npx vitest watch useFactor

# Запустить только юнит-тесты
npx vitest run useFactor.spec

# Запустить только интеграционные тесты
npx vitest run useFactor.integration
```

## Примеры тестовых сценариев

### Сценарий 1: Покупка USDT за RUB
```typescript
// Малая сумма (1000 RUB)
calculateFactor(1000);
expect(factor.value).toBe(1.04); // VAT_BIG = 4%

// Большая сумма (5000 RUB)
calculateFactor(5000);
expect(factor.value).toBe(1.02); // VAT_SMALL = 2%

// Возврат к малой сумме (500 RUB)
calculateFactor(500);
expect(factor.value).toBe(1.04); // ✅ Должен вернуться к VAT_BIG
```

### Сценарий 2: Продажа USDT за RUB
```typescript
// Малая сумма (1000 RUB)
calculateFactor(1000);
expect(factor.value).toBe(0.96); // 1 - (VAT_BIG / 100)

// Большая сумма (5000 RUB)
calculateFactor(5000);
expect(factor.value).toBe(0.98); // 1 - (VAT_SMALL / 100)
```

## Формулы расчета

### Покупка криптовалюты (isValuteForSell = true)
```
factor = 1 + (calculateAmount < 3000 ? VAT_BIG : VAT_SMALL) / 100
```

### Продажа криптовалюты (isValuteForSell = false)
```
factor = 1 - (calculateAmount < 3000 ? VAT_BIG : VAT_SMALL) / 100
```

## Тестовые данные

### USDT
- VAT_BIG: 4%
- VAT_SMALL: 2%

### TON/NOT
- VAT_BIG: 5%
- VAT_SMALL: 3%

### Порог переключения комиссии
- < 3000 RUB → VAT_BIG (высокая комиссия)
- >= 3000 RUB → VAT_SMALL (низкая комиссия)

# Исправление ошибки Proxy в геймификации FREEZE

## Проблема

При использовании геймификации FREEZE возникала ошибка:

```
TypeError: 'get' on proxy: property 'BackButton' is a read-only and non-configurable 
data property on the proxy target but the proxy did not return its actual value
```

## Причина

Ошибка возникала из-за:
1. Использования `readonly()` обертки на reactive объектах
2. Множественной деструктуризации reactive значений
3. Отсутствия singleton паттерна для composable

## Решение

### 1. Singleton паттерн в composable

```typescript
// composables/gamification/useFreezePromotion.ts

let freezeInstance: ReturnType<typeof createFreezePromotion> | null = null;

const createFreezePromotion = () => {
  // ... вся логика
  
  return {
    state,                    // ✅ Без readonly
    showModal,                // ✅ Без readonly
    isFreezed: computed(...), // ✅ computed для реактивности
    formattedTime: computed(...),
    checkAndActivate,
    closeModal,
    deactivateFreeze,
    cleanup,
  };
};

export const useFreezePromotion = () => {
  if (!freezeInstance) {
    freezeInstance = createFreezePromotion();
  }
  return freezeInstance;
};
```

### 2. Правильное использование в компонентах

**❌ Неправильно:**
```vue
<script setup>
const { isFreezed, showModal } = useFreezePromotion();
// Теряется реактивность при деструктуризации
</script>
```

**✅ Правильно:**
```vue
<template>
  <div>
    <FreezeModal 
      :show="freeze.showModal.value" 
      :formatted-time="freeze.formattedTime.value"
      @close="freeze.closeModal"
    />
  </div>
</template>

<script setup>
const freeze = useFreezePromotion();
// Сохраняется реактивность через доступ к .value

onMounted(() => {
  freeze.checkAndActivate();
});

onUnmounted(() => {
  freeze.cleanup();
});
</script>
```

### 3. Безопасное использование в других composables

```typescript
// composables/exchanger/useFactor.ts

const getFreezePromotion = () => {
  if (process.client) {
    try {
      return useFreezePromotion();
    } catch (e) {
      return null;
    }
  }
  return null;
};

const calculateFactor = (amount: number, useBasePrice: boolean = false) => {
  const freezePromotion = getFreezePromotion();
  
  if (freezePromotion?.isFreezed.value) {
    // Используем .value для доступа к computed значению
  }
};
```

### 4. В компонентах с условным рендерингом

```vue
<script setup>
// components/Exchanger/RightExchangerBlock.vue

const isFreezeActive = computed(() => {
  if (process.client) {
    try {
      return useFreezePromotion().isFreezed.value;
    } catch (e) {
      return false;
    }
  }
  return false;
});
</script>

<template>
  <div v-if="!isFreezeActive" class="exchanger__promocode">
    <!-- Промокод скрыт при активной акции -->
  </div>
</template>
```

## Ключевые правила

### ✅ DO (Правильно)

1. **Используйте singleton для composable:**
   - Один экземпляр на всё приложение
   - Избегайте множественных вызовов создания reactive состояния

2. **Не деструктурируйте reactive объекты:**
   - Храните ссылку на весь объект: `const freeze = useFreezePromotion()`
   - Доступ через точку: `freeze.isFreezed.value`

3. **Используйте computed для производных значений:**
   - `isFreezed: computed(() => state.isActive)`
   - Автоматическая реактивность

4. **Добавляйте cleanup:**
   - Очистка интервалов в onUnmounted
   - Предотвращение утечек памяти

### ❌ DON'T (Неправильно)

1. **Не оборачивайте в readonly:**
   ```typescript
   // ❌ Вызывает proxy конфликты
   return {
     state: readonly(state),
     showModal: readonly(showModal),
   };
   ```

2. **Не деструктурируйте сразу:**
   ```typescript
   // ❌ Теряется реактивность
   const { isFreezed, showModal } = useFreezePromotion();
   ```

3. **Не используйте onUnmounted внутри singleton composable:**
   ```typescript
   // ❌ В singleton это не сработает корректно
   const createFreezePromotion = () => {
     onUnmounted(() => {
       // Это не вызовется правильно
     });
   };
   ```

4. **Не создавайте множественные экземпляры:**
   ```typescript
   // ❌ Каждый вызов создает новое состояние
   export const useFreezePromotion = () => {
     const state = reactive({...});
     return { state };
   };
   ```

## Тестирование исправлений

После применения исправлений проверьте:

1. **Нет ошибок proxy в консоли**
   - Откройте DevTools
   - Обновите страницу
   - Убедитесь, что ошибок нет

2. **Реактивность работает**
   - Модалка показывается при активации
   - Таймер обновляется каждую секунду
   - Плашка появляется и исчезает корректно

3. **Промокод скрывается**
   - При активной акции поле промокода скрыто
   - После окончания акции поле появляется

4. **Комиссия применяется**
   - Проверьте расчеты с активной акцией
   - Комиссия должна быть 1% для всех сумм

## Команда для очистки состояния

Если нужно сбросить состояние для тестирования:

```javascript
// В консоли браузера
localStorage.removeItem('mfz_freeze_state');
localStorage.removeItem('mfz_freeze_history');
location.reload();
```

## Полезные ссылки

- [Vue 3 Reactivity Docs](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Composables Best Practices](https://vuejs.org/guide/reusability/composables.html)
- [readonly() API](https://vuejs.org/api/reactivity-core.html#readonly)

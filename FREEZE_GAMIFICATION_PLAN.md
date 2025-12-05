# План геймификации "FREEZE" - Зимняя акция с комиссией 1%

## 📋 Обзор функционала

Временная акция, которая рандомно активируется для пользователей и предоставляет сниженную комиссию 1% на все операции обмена в течение 5 минут.

## 🎯 Основные компоненты
Если акция активна то поле промокод скрывается

### 1. Конфигурация через ENV

```env
# Feature flags
GAMIFICATION_FREEZE_ENABLED=true
GAMIFICATION_FREEZE_CHANCE=0.1  # 10% шанс активации
GAMIFICATION_FREEZE_DURATION=300000  # 5 минут в миллисекундах
GAMIFICATION_FREEZE_COMMISSION=1  # Фиксированная комиссия 1%
```

### 2. Структура файлов

```
composables/
├── gamification/
│   ├── useFreezePromotion.ts     # Основная логика акции
│   └── useFreezeStorage.ts       # Хранение состояния в localStorage/sessionStorage

components/
├── Gamification/
│   ├── FreezeModal.vue           # Модалка с информацией об акции
│   ├── FreezeBadge.vue           # Плашка "1%" с анимацией
│   └── FreezeEffects.vue         # Визуальные эффекты (снег, ветер)

assets/
├── animations/
│   ├── wind-particles.json       # Lottie анимация ветра
│   └── snowflakes.json           # Lottie анимация снега

styles/
└── freeze-theme.scss              # Стили для "замороженных" элементов
```

## 🔧 Техническая реализация

### Composable: useFreezePromotion

```typescript
interface FreezeState {
  isActive: boolean
  activatedAt: number | null
  expiresAt: number | null
  remainingTime: number
}

export const useFreezePromotion = () => {
  const config = useRuntimeConfig()
  const isEnabled = config.public.gamificationFreezeEnabled
  
  const state = reactive<FreezeState>({
    isActive: false,
    activatedAt: null,
    expiresAt: null,
    remainingTime: 0
  })
  
  // Проверка и активация при входе
  const checkAndActivate = () => {
    if (!isEnabled) return false
    
    const chance = Math.random()
    if (chance <= config.public.gamificationFreezeChance) {
      activateFreeze()
      return true
    }
    return false
  }
  
  // Активация акции
  const activateFreeze = () => {
    const now = Date.now()
    state.isActive = true
    state.activatedAt = now
    state.expiresAt = now + config.public.gamificationFreezeDuration
    
    // Сохраняем в storage
    saveToStorage(state)
    
    // Запускаем таймер
    startCountdown()
    
    // Триггерим визуальные эффекты
    triggerFreezeEffects()
  }
  
  // Обновление таймера
  const startCountdown = () => {
    const interval = setInterval(() => {
      if (!state.expiresAt) return
      
      const remaining = state.expiresAt - Date.now()
      if (remaining <= 0) {
        deactivateFreeze()
        clearInterval(interval)
      } else {
        state.remainingTime = remaining
      }
    }, 1000)
  }
  
  return {
    state: readonly(state),
    checkAndActivate,
    isFreezed: computed(() => state.isActive),
    formattedTime: computed(() => formatTime(state.remainingTime))
  }
}
```

### Интеграция с useFactor.ts

```typescript
// Модифицируем существующий useFactor
export const useFactor = () => {
  const { isFreezed } = useFreezePromotion()
  
  const calculateFactor = (amount: number, useBasePrice: boolean = false) => {
    // Если активна акция Freeze - всегда возвращаем 1%
    if (isFreezed.value) {
      VAT_BIG.value = 1
      VAT_SMALL.value = 1
      vatValue.value = 1.01  // factor с комиссией 1%
      return
    }
    
    // Существующая логика расчета...
  }
}
```

## 🎨 UI/UX компоненты

### FreezeModal.vue

```vue
<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog @close="close" class="freeze-modal">
      <div class="freeze-modal__backdrop" />
      
      <div class="freeze-modal__container">
        <DialogPanel class="freeze-modal__panel">
          <!-- Эффект льда по краям -->
          <div class="ice-border" />
          
          <!-- Анимация снежинок -->
          <SnowflakeAnimation />
          
          <div class="freeze-modal__content">
            <div class="freeze-modal__icon">
              <IconSnowflake class="animate-spin-slow" />
            </div>
            
            <h2 class="freeze-modal__title">
              FREEEEEEZZZZE!
            </h2>
            
            <p class="freeze-modal__text">
              ❄️ Комиссия <span class="highlight">1%</span> на 1 сделку
              <br />
              с любой парой в течение <span class="highlight">5 минут</span>
            </p>
            
            <div class="freeze-modal__timer">
              <IconClock />
              <span>{{ formattedTime }}</span>
            </div>
            
            <button @click="close" class="freeze-modal__btn">
              Начать обмен
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
```

### FreezeBadge.vue

```vue
<template>
  <Transition name="freeze-badge">
    <div v-if="isFreezed" class="freeze-badge">
      <!-- Анимация ветра на фоне -->
      <div class="wind-effect" />
      
      <!-- "Замороженная" плашка -->
      <div class="freeze-badge__container">
        <div class="ice-texture" />
        <div class="freeze-badge__content">
          <IconSnowflake class="freeze-badge__icon" />
          <span class="freeze-badge__text">1%</span>
        </div>
        
        <!-- Таймер -->
        <div class="freeze-badge__timer">
          {{ formattedTime }}
        </div>
      </div>
    </div>
  </Transition>
</template>
```

## 🎭 Визуальные эффекты

### Анимации
- **Ветер**: Частицы, движущиеся горизонтально через экран
- **Снежинки**: Падающие снежинки с разной скоростью и размером
- **Лед**: CSS эффект "замерзания" с использованием `backdrop-filter` и градиентов
- **Пульсация**: Плавная анимация плашки с комиссией

### Стили freeze-theme.scss

```scss
// Переменные темы
$freeze-blue: #00d4ff;
$freeze-white: #ffffff;
$freeze-dark: #0a2540;
$ice-gradient: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,212,255,0.2));

// Эффект льда
.ice-texture {
  background: $ice-gradient;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 
    inset 0 0 20px rgba(255,255,255,0.2),
    0 0 40px rgba(0,212,255,0.3);
}

// Анимация ветра
@keyframes wind-blow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

// Анимация снежинок
@keyframes snowfall {
  0% { transform: translateY(-100vh) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(360deg); }
}
```

## 📊 Метрики и аналитика

### События для отслеживания

```typescript
// composables/gamification/useFreezeAnalytics.ts
export const useFreezeAnalytics = () => {
  const trackEvent = (eventName: string, params?: any) => {
    // Google Analytics / Яндекс.Метрика
    gtag('event', eventName, {
      event_category: 'gamification',
      event_label: 'freeze_promotion',
      ...params
    })
  }
  
  return {
    trackActivation: () => trackEvent('freeze_activated'),
    trackModalShown: () => trackEvent('freeze_modal_shown'),
    trackModalClosed: () => trackEvent('freeze_modal_closed'),
    trackExchangeWithFreeze: (pair: string, amount: number) => 
      trackEvent('freeze_exchange_completed', { pair, amount }),
    trackExpired: () => trackEvent('freeze_expired')
  }
}
```

## 🔄 Жизненный цикл акции

1. **Вход пользователя**
   - Проверка feature flag `GAMIFICATION_FREEZE_ENABLED`
   - Рандомная проверка с шансом `GAMIFICATION_FREEZE_CHANCE`
   - Проверка истории (не чаще 1 раза в час на пользователя)

2. **Активация**
   - Показ модалки с анимацией
   - Запуск таймера на 5 минут
   - Сохранение состояния в localStorage
   - Применение комиссии 1% ко всем операциям

3. **Во время акции**
   - Отображение плашки с таймером
   - Визуальные эффекты на странице
   - Блокировка VAT_BIG и VAT_SMALL на значении 1

4. **Завершение**
   - Плавное исчезновение эффектов
   - Возврат стандартных комиссий
   - Очистка localStorage
   - Запись в историю

## 🛡️ Защита от злоупотреблений

- **Rate limiting**: Максимум 1 активация в час на IP/пользователя
- **Session tracking**: Привязка к сессии для предотвращения манипуляций
- **Server validation**: Проверка времени активации на сервере при обмене
- **Fingerprinting**: Использование browser fingerprint для идентификации

## 📱 Мобильная адаптация

- Адаптивные размеры плашки и модалки
- Touch-friendly кнопки
- Оптимизированные анимации для мобильных устройств
- Haptic feedback при активации (для Telegram Mini App)

## 🚀 План внедрения

### Фаза 1: MVP (1-2 дня)
- [ ] Базовая логика активации и таймера
- [ ] Простая модалка без анимаций
- [ ] Интеграция с useFactor.ts
- [ ] ENV конфигурация

### Фаза 2: Визуал (2-3 дня)
- [ ] Анимации снега и ветра
- [ ] Стилизация под "лед"
- [ ] Плашка с таймером

### Фаза 3: Аналитика (1 день)
- [ ] События для отслеживания
- [ ] Dashboard метрик
- [ ] A/B тестирование

### Фаза 4: Оптимизация (1-2 дня)
- [ ] Performance оптимизация анимаций
- [ ] Защита от злоупотреблений
- [ ] Тестирование на разных устройствах

## 🧪 Тестирование

### Unit тесты
- Логика активации и деактивации
- Расчет комиссий во время акции
- Таймер и обратный отсчет

### E2E тесты
- Сценарий полного цикла акции
- Проверка визуальных эффектов
- Корректность применения комиссии

### Ручное тестирование
- Различные устройства и браузеры
- Производительность анимаций
- Edge cases (обновление страницы, закрытие вкладки)

## 📝 Примечания
- Визуальные эффекты не должны мешать основному функционалу
- Предусмотреть возможность быстрого отключения через ENV
- Подготовить fallback для браузеров без поддержки современных CSS эффектов

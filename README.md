# MFZ Exchanger

Обменник криптовалют MFZ - приложение для обмена криптовалюты и фиатных средств.

## Требования

- Node.js 18+
- npm или yarn

## Установка

```bash
# Установить зависимости
npm install
```

## Настройка

Создайте файл `.env` в корне проекта на основе `.env.example`:

```env
databaseURL=your_firebase_database_url
ASSETS_IMAGE_BUCKET=your_assets_bucket_url
SITE_URL=http://localhost:8081
```

## Запуск

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен-сборки
npm run preview
```

Приложение будет доступно по адресу: http://localhost:8081

## Структура проекта

- `/components` - Vue компоненты
  - `/App` - Универсальные UI компоненты
  - `/Exchanger` - Компоненты обменника
- `/composables` - Переиспользуемые композабл-функции
- `/stores` - Pinia хранилища
- `/pages` - Страницы приложения (file-based routing)
- `/api` - API интеграции
- `/helpers` - Вспомогательные функции
- `/style` - Глобальные стили
- `/layouts` - Лейауты страниц
- `/middleware` - Middleware для маршрутов
- `/plugins` - Nuxt плагины

## Технологии

- Nuxt 3
- Vue 3
- Pinia (state management)
- Firebase Realtime Database
- Vuelidate (валидация форм)
- Tailwind CSS
- SCSS
- Maska (маски ввода)
- Axios

## Лицензия

Private

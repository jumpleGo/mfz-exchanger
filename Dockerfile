FROM node:22-alpine

# Установка зависимостей для сборки
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
# Установка зависимостей
RUN npm ci

# Копируем остальные файлы
COPY . .

# Build-time переменные для публичных env
ARG NUXT_databaseURL
ARG NUXT_ASSETS_IMAGE_BUCKET
ARG NUXT_SITE_URL
ARG NUXT_TELEGRAM_BOT_USERNAME

# Runtime переменная для приватного токена
ARG NUXT_TELEGRAM_BOT_TOKEN
ARG NUXT_TELEGRAM_ADMIN_CHAT_ID

# Устанавливаем переменные для билда
ENV NUXT_databaseURL=$NUXT_databaseURL
ENV NUXT_ASSETS_IMAGE_BUCKET=$NUXT_ASSETS_IMAGE_BUCKET
ENV NUXT_SITE_URL=$NUXT_SITE_URL
ENV NUXT_TELEGRAM_BOT_USERNAME=$NUXT_TELEGRAM_BOT_USERNAME
ENV NUXT_TELEGRAM_BOT_TOKEN=$NUXT_TELEGRAM_BOT_TOKEN
ENV NUXT_TELEGRAM_ADMIN_CHAT_ID=$NUXT_TELEGRAM_ADMIN_CHAT_ID

# Сборка приложения
RUN npm run build

# Удаляем dev зависимости после билда для уменьшения размера
RUN npm prune --production

EXPOSE 3000

# Запуск приложения
CMD ["node", ".output/server/index.mjs"]

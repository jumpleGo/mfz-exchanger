FROM node:18-alpine AS base

# Установка зависимостей для сборки
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копируем остальные файлы
COPY . .

# Сборка приложения
RUN npm run build

# Production образ
FROM node:18-alpine AS runner

WORKDIR /app

# Создаем пользователя для запуска приложения
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Копируем собранное приложение
COPY --from=base --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=base --chown=nuxtjs:nodejs /app/package.json /app/package.json

USER nuxtjs

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Запуск приложения
CMD ["node", ".output/server/index.mjs"]

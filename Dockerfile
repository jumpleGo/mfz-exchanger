FROM node:22-alpine

# Установка зависимостей для сборки
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
# Установка зависимостей
RUN npm ci

# Копируем остальные файлы
COPY . .

# Сборка приложения
RUN npm run build

# Удаляем dev зависимости после билда для уменьшения размера
RUN npm prune --production

EXPOSE 3000

# Запуск приложения
CMD ["node", ".output/server/index.mjs"]

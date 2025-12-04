#!/bin/bash

# Скрипт для запуска Docker контейнера
# Использование: ./scripts/docker-run.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

IMAGE_NAME="mfz-exchanger"
CONTAINER_NAME="mfz-exchanger-app"
PORT=3000

echo -e "${YELLOW}=== Docker Deployment ===${NC}\n"

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${RED}Ошибка: Файл .env не найден${NC}"
    echo "Создайте .env файл на основе .env.example"
    exit 1
fi

# Остановка и удаление существующего контейнера
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo -e "${YELLOW}Остановка существующего контейнера...${NC}"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Загрузка переменных из .env
source .env

# Сборка образа с build args
echo -e "${YELLOW}Сборка Docker образа с build args...${NC}"
docker build \
  --build-arg NUXT_databaseURL="$NUXT_databaseURL" \
  --build-arg NUXT_ASSETS_IMAGE_BUCKET="$NUXT_ASSETS_IMAGE_BUCKET" \
  --build-arg NUXT_SITE_URL="$NUXT_SITE_URL" \
  --build-arg NUXT_TELEGRAM_BOT_USERNAME="$NUXT_TELEGRAM_BOT_USERNAME" \
  --build-arg NUXT_TELEGRAM_BOT_TOKEN="$NUXT_TELEGRAM_BOT_TOKEN" \
  -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Образ успешно собран${NC}\n"
else
    echo -e "${RED}✗ Ошибка при сборке образа${NC}"
    exit 1
fi

# Запуск контейнера
echo -e "${YELLOW}Запуск контейнера...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -e NUXT_TELEGRAM_BOT_TOKEN="$NUXT_TELEGRAM_BOT_TOKEN" \
  --restart unless-stopped \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Контейнер успешно запущен${NC}\n"
    echo -e "${GREEN}Приложение доступно на:${NC} http://localhost:$PORT"
    echo ""
    echo -e "${YELLOW}Полезные команды:${NC}"
    echo "  Просмотр логов:     docker logs -f $CONTAINER_NAME"
    echo "  Остановка:          docker stop $CONTAINER_NAME"
    echo "  Запуск:             docker start $CONTAINER_NAME"
    echo "  Удаление:           docker rm -f $CONTAINER_NAME"
else
    echo -e "${RED}✗ Ошибка при запуске контейнера${NC}"
    exit 1
fi

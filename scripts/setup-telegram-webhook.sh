#!/bin/bash

# Скрипт для настройки Telegram Webhook
# Использование: ./scripts/setup-telegram-webhook.sh

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Настройка Telegram Webhook ===${NC}\n"

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${RED}Ошибка: Файл .env не найден${NC}"
    echo "Создайте .env файл на основе .env.example"
    exit 1
fi

# Загрузка переменных из .env
source .env

# Проверка переменных
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}Ошибка: TELEGRAM_BOT_TOKEN не установлен в .env${NC}"
    exit 1
fi

if [ -z "$SITE_URL" ]; then
    echo -e "${RED}Ошибка: SITE_URL не установлен в .env${NC}"
    exit 1
fi

WEBHOOK_URL="${SITE_URL}/api/telegram/webhook"

echo -e "${YELLOW}Bot Token:${NC} ${TELEGRAM_BOT_TOKEN:0:10}..."
echo -e "${YELLOW}Webhook URL:${NC} $WEBHOOK_URL"
echo ""

# Выбор действия
echo "Выберите действие:"
echo "1) Установить webhook"
echo "2) Проверить webhook"
echo "3) Удалить webhook"
echo "4) Получить информацию о боте"
read -p "Введите номер (1-4): " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Установка webhook...${NC}"
        response=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
            -H "Content-Type: application/json" \
            -d "{\"url\": \"$WEBHOOK_URL\"}")
        
        if echo "$response" | grep -q '"ok":true'; then
            echo -e "${GREEN}✓ Webhook успешно установлен${NC}"
            echo "$response" | python3 -m json.tool
        else
            echo -e "${RED}✗ Ошибка при установке webhook${NC}"
            echo "$response" | python3 -m json.tool
        fi
        ;;
    
    2)
        echo -e "\n${YELLOW}Проверка webhook...${NC}"
        response=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")
        echo "$response" | python3 -m json.tool
        ;;
    
    3)
        echo -e "\n${YELLOW}Удаление webhook...${NC}"
        response=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook")
        
        if echo "$response" | grep -q '"ok":true'; then
            echo -e "${GREEN}✓ Webhook успешно удален${NC}"
        else
            echo -e "${RED}✗ Ошибка при удалении webhook${NC}"
        fi
        echo "$response" | python3 -m json.tool
        ;;
    
    4)
        echo -e "\n${YELLOW}Информация о боте...${NC}"
        response=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")
        echo "$response" | python3 -m json.tool
        ;;
    
    *)
        echo -e "${RED}Неверный выбор${NC}"
        exit 1
        ;;
esac

echo ""

#!/bin/bash

# Скрипт для настройки Telegram Webhook на продакшене
# Использование: ./scripts/setup-production-webhook.sh YOUR_BOT_TOKEN YOUR_DOMAIN

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Использование: ./scripts/setup-production-webhook.sh BOT_TOKEN DOMAIN${NC}"
    echo "Пример: ./scripts/setup-production-webhook.sh 123456:ABC-DEF https://mysite.com"
    exit 1
fi

BOT_TOKEN=$1
DOMAIN=$2
WEBHOOK_URL="${DOMAIN}/api/telegram/webhook"

echo -e "${YELLOW}=== Настройка Production Webhook ===${NC}\n"
echo -e "${YELLOW}Webhook URL:${NC} $WEBHOOK_URL"
echo ""

# Установка webhook
echo -e "${YELLOW}Установка webhook...${NC}"
response=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$WEBHOOK_URL\"}")

if echo "$response" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ Webhook успешно установлен${NC}"
    echo "$response" | python3 -m json.tool
    
    echo ""
    echo -e "${GREEN}Webhook настроен на:${NC} $WEBHOOK_URL"
    echo -e "${YELLOW}Проверьте статус:${NC}"
    echo "curl https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
else
    echo -e "${RED}✗ Ошибка при установке webhook${NC}"
    echo "$response" | python3 -m json.tool
    exit 1
fi

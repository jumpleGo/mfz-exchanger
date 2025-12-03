# Деплой приложения с Telegram интеграцией

## Общий процесс

1. **Деплой приложения** (как обычно Nuxt SSR)
2. **Настройка переменных окружения**
3. **Настройка Telegram webhook** (один раз)

## Переменные окружения

На продакшен сервере создайте `.env`:

```env
databaseURL=https://your-project.firebaseio.com
ASSETS_IMAGE_BUCKET=https://storage.googleapis.com/your-bucket
SITE_URL=https://your-domain.com
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_bot_username
```

⚠️ **ВАЖНО:** `SITE_URL` должен быть **HTTPS** для работы Telegram webhook!

## Деплой на разных платформах

### Vercel / Netlify

Эти платформы **не поддерживают** длинные polling соединения для Telegram webhook.

**Решение:** Используйте serverless функции + внешний webhook handler или VPS.

### VPS (Ubuntu/Debian)

#### 1. Установка зависимостей

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 для управления процессом
sudo npm install -g pm2
```

#### 2. Клонирование и установка

```bash
git clone <your-repo>
cd mfz-exchanger
npm install
```

#### 3. Настройка .env

```bash
cp .env.example .env
nano .env
# Заполните все переменные
```

#### 4. Сборка и запуск

```bash
# Сборка
npm run build

# Запуск через PM2
pm2 start ecosystem.config.js

# Сохранить для автозапуска
pm2 save
pm2 startup
```

#### 5. Настройка Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 6. SSL сертификат (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Docker

#### Вариант 1: Через скрипт (рекомендуется)

```bash
# Создайте .env файл
cp .env.example .env
nano .env  # заполните переменные

# Запустите
./scripts/docker-run.sh
```

Скрипт автоматически:
- Соберет образ
- Остановит старый контейнер (если есть)
- Запустит новый контейнер с restart policy

#### Вариант 2: Вручную

```bash
# Сборка образа
docker build -t mfz-exchanger .

# Запуск контейнера
docker run -d \
  --name mfz-exchanger-app \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  mfz-exchanger
```

#### Управление контейнером

```bash
# Просмотр логов
docker logs -f mfz-exchanger-app

# Остановка
docker stop mfz-exchanger-app

# Запуск
docker start mfz-exchanger-app

# Перезапуск
docker restart mfz-exchanger-app

# Удаление
docker rm -f mfz-exchanger-app
```

#### Обновление после изменений

```bash
# Пересобрать и перезапустить
./scripts/docker-run.sh

# Или вручную
docker build -t mfz-exchanger .
docker stop mfz-exchanger-app
docker rm mfz-exchanger-app
docker run -d --name mfz-exchanger-app -p 3000:3000 --env-file .env --restart unless-stopped mfz-exchanger
```

## Настройка Telegram Webhook

### После деплоя

**Вариант 1: Через скрипт**

```bash
./scripts/setup-production-webhook.sh YOUR_BOT_TOKEN https://your-domain.com
```

**Вариант 2: Вручную**

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### Проверка webhook

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

Должно вернуть:

```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40
  }
}
```

## PM2 Ecosystem config

Создайте `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mfz-exchanger',
    script: './.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

## Мониторинг

### Проверка работы webhook

```bash
# Логи PM2
pm2 logs mfz-exchanger

# Или напрямую
tail -f logs/combined.log | grep Telegram
```

### Тестирование

1. Откройте Mini App в Telegram
2. Создайте заявку
3. Проверьте что пришло уведомление
4. Нажмите "Я оплатил"
5. Проверьте обновление статуса

## Обновление после изменений

```bash
# Получить изменения
git pull

# Установить зависимости (если изменились)
npm install

# Пересобрать
npm run build

# Перезапустить
pm2 reload mfz-exchanger
```

## Troubleshooting

### Webhook не работает

**Проверка 1: URL доступен**
```bash
curl https://your-domain.com/api/telegram/webhook
```

**Проверка 2: HTTPS работает**
```bash
curl -I https://your-domain.com
```

**Проверка 3: Логи сервера**
```bash
pm2 logs mfz-exchanger --lines 100
```

**Проверка 4: Webhook установлен**
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### Переустановка webhook

```bash
# Удалить
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"

# Установить заново
./scripts/setup-production-webhook.sh YOUR_BOT_TOKEN https://your-domain.com
```

### Ошибки SSL

Telegram требует **валидный SSL сертификат**. Используйте Let's Encrypt:

```bash
sudo certbot renew --dry-run
```

## CI/CD Example (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/mfz-exchanger
            git pull
            npm install
            npm run build
            pm2 reload mfz-exchanger
      
      - name: Setup Telegram Webhook
        run: |
          curl -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/setWebhook" \
            -H "Content-Type: application/json" \
            -d '{"url": "${{ secrets.SITE_URL }}/api/telegram/webhook"}'
```

## Безопасность

1. **Не коммитьте .env** в git
2. **Используйте HTTPS** (обязательно для Telegram)
3. **Ограничьте доступ** к Firebase только с вашего сервера
4. **Регулярно обновляйте** зависимости: `npm audit fix`

## Чек-лист деплоя

- [ ] Приложение собрано (`npm run build`)
- [ ] Все переменные в `.env` настроены
- [ ] HTTPS настроен и работает
- [ ] PM2 запущен и в автозагрузке
- [ ] Nginx настроен и работает
- [ ] Telegram webhook установлен
- [ ] Webhook URL отвечает 200 OK
- [ ] Тестовая заявка создана и уведомление пришло
- [ ] Кнопка "Я оплатил" работает
- [ ] Логи проверены, ошибок нет

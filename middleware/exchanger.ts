import { storeToRefs } from "pinia";
import { useExchangerStore } from "~/stores/exchanger";
import { useGetter } from "~/composables/useGetter";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return;
  
  const { activeTransaction } = storeToRefs(useExchangerStore());
  const { getActiveUserTransaction } = useGetter();
  const { getTelegramUserData } = useTelegramAuth();
  const { waitForTelegram, isTelegramBrowser } = useTelegramWebApp();
  
  // Если в Telegram, ждем инициализации WebApp
  if (isTelegramBrowser.value) {
    await waitForTelegram();
  }
  
  // Получаем telegram username
  let telegramUsername = null;
  
  // Пытаемся получить username из Telegram WebApp
  const telegramUser = getTelegramUserData();
  if (telegramUser?.username) {
    telegramUsername = telegramUser.username;
  } else if (telegramUser?.first_name) {
    telegramUsername = telegramUser.first_name.replace(/\s+/g, '');
  }
  
  // Если не в Telegram, пытаемся получить из localStorage (кэш)
  if (!telegramUsername) {
    const cachedTransaction = window.localStorage.getItem("transaction");
    if (cachedTransaction) {
      try {
        const parsed = JSON.parse(cachedTransaction);
        telegramUsername = parsed.telegram;
      } catch (e) {
        console.error('[Middleware] Failed to parse cached transaction:', e);
      }
    }
  }
  
  // Если есть username - ищем активную транзакцию в Firebase
  if (telegramUsername) {
    try {
      console.log(`[Middleware] Checking active transaction for @${telegramUsername}`);
      const result = await getActiveUserTransaction(telegramUsername);
      
      if (result) {
        console.log(`[Middleware] Found active transaction:`, result.transaction.status);
        activeTransaction.value = {
          ...result.transaction,
          key: result.key
        };
        
        // Обновляем localStorage как кэш
        window.localStorage.setItem("transaction", JSON.stringify({
          ...result.transaction,
          key: result.key
        }));
        
        // Загружаем expTime из транзакции
        if (result.transaction.expirationTime) {
          window.localStorage.setItem("expTime", result.transaction.expirationTime);
        }
      } else {
        console.log(`[Middleware] No active transaction found`);
        // Очищаем устаревший кэш
        window.localStorage.removeItem("transaction");
        window.localStorage.removeItem("expTime");
        activeTransaction.value = null;
      }
    } catch (error) {
      console.error('[Middleware] Error checking transaction:', error);
    }
  }
  
  navigateTo(to.path);
});

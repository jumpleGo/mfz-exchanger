import type { IActiveTransaction } from '~/stores/exchangerTypes'
import { storeToRefs } from 'pinia'

export const sendNotification = async (payload: IActiveTransaction) => {
  try {
    const mail = useMail()
    const {isStarsBuy} = storeToRefs(useExchangerStore())

    const transactionType = isStarsBuy.value ? 'ЗВЕЗД' : '';
    const subject = `Обмен ${transactionType} на MFZ-Exchanger`;
    const text = `Новый обмен ${transactionType} от @${payload.telegram}
    
${payload.sell.toUpperCase()} ${payload.countSell} → ${payload.buy.toUpperCase()} ${payload.countBuy}

${payload.address ? `Адрес: ${payload.address}` : ''}
${payload.net ? `Сеть: ${payload.net}` : ''}
${payload.memo ? `Memo: ${payload.memo}` : ''}

Открыть админку: https://moneyflowzen.ru/adminex`;

    await mail.send({
      config: 'main',
      from: 'mailer@moneyflowzen.ru',
      subject,
      text,
    });
    
    console.log('[Email] Notification sent successfully');
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
  }
};
import type { IActiveTransaction } from '~/stores/exchangerTypes'
import { storeToRefs } from 'pinia'

export const sendNotification = (payload: IActiveTransaction) => {
  const mail = useMail()
  const {isStarsBuy} = storeToRefs(useExchangerStore())

  const transactionType = isStarsBuy.value ? 'ЗВЕЗД' : '';
  const subject = `Обмен ${transactionType} на MFZ-Exchanger`;
  const text = `Новый обмен ${transactionType} от @${payload.telegram} \n
    ${payload.sell.toUpperCase()} ${payload.countSell} → ${payload.buy.toUpperCase()} ${payload.countBuy} \n
    https://moneyflowzen.ru/adminex`;

  mail.send({
    config: 'main',
    from: subject,
    subject,
    text,
  });
};
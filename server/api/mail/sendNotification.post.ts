import type { IActiveTransaction } from '~/stores/exchangerTypes'
import {getMailFrom, getMailTransporter} from "~/server/utils/nodemailer";

export default defineEventHandler(async (event) => {
  try {
    const { transaction } = await readBody<{ transaction: IActiveTransaction }>(event)
    const transporter = getMailTransporter()
    const from = getMailFrom()

    const isStarsBuy = transaction.buy === 'stars'
    const transactionType = isStarsBuy ? 'ЗВЕЗД' : ''
    const subject = `Обмен ${transactionType} на MFZ-Exchanger`
    
    const text = `Новый обмен ${transactionType} от @${transaction.telegram}
    
${transaction.sell.toUpperCase()} ${transaction.countSell} → ${transaction.buy.toUpperCase()} ${transaction.countBuy}

${transaction.address ? `Адрес: ${transaction.address}` : ''}
${transaction.net ? `Сеть: ${transaction.net}` : ''}
${transaction.memo ? `Memo: ${transaction.memo}` : ''}

Открыть админку: https://moneyflowzen.ru/adminex`

    await transporter.sendMail({
      from,
      to: 'rrotatew@gmail.com',
      subject,
      text
    })

    console.log('[Email] Notification sent successfully')

    return {
      success: true,
      message: 'Email sent successfully'
    }
  } catch (error: any) {
    console.error('[Email] Failed to send notification:', error)
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send email notification'
    })
  }
})

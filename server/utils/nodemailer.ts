import nodemailer from 'nodemailer'

const nodemailerConfig = {
  from: '"Эмиль из MFZ" <mailer@moneyflowzen.ru>',
  host: "smtp.timeweb.ru",
  port: 2525,
  secure: false,
  auth: {
    user: "mailer@moneyflowzen.ru",
    pass: ":nB0.?MY}-%Qb|",
  },
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

export const getMailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: nodemailerConfig.host,
      port: nodemailerConfig.port,
      secure: nodemailerConfig.secure,
      auth: nodemailerConfig.auth,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      pool: true,
      maxConnections: 5,
      maxMessages: 10
    })
  }
  return transporter
}

export const getMailFrom = () => nodemailerConfig.from

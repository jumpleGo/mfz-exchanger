export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  rootDir: ".",

  devServer: {
    port: 8081,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "ru",
      },
      title: 'MFZ Exchanger',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'MFZ Exchanger - обменник криптовалют' }
      ]
    },
  },

  alias: {
    "@css": "/<rootDir>/style",
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/style/variables.scss" as *;',
        },
      },
    },
  },

  css: ["~/style/global.scss"],
  compatibilityDate: "2024-09-08",

  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    [
      "nuxt-mail",
      {
        message: [{ name: "main", to: "rrotatew@gmail.com" }],
        smtp: {
          host: "smtp.timeweb.ru",
          port: 2525,
          secure: false,
          requireTLS: true,
          auth: {
            user: "mailer@moneyflowzen.ru",
            pass: ":nB0.?MY}-%Qb|",
          },
        },
      },
    ],
    "@nuxt/image",
  ],

  runtimeConfig: {
    public: {
      databaseURL: process.env.databaseURL,
      ASSETS_IMAGE_BUCKET: process.env.ASSETS_IMAGE_BUCKET,
      SITE_URL: process.env.SITE_URL,
    },
  },
});

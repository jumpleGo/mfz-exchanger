export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  rootDir: ".",

  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
  },

  routeRules: {
    '/': { ssr: true, prerender: false },
  },

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
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no' 
        },
        { name: 'description', content: 'MFZ Exchanger - обменник криптовалют' }
      ],
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js',
          defer: true
        }
      ]
    },
  },

  alias: {
    "@css": "/<rootDir>/style",
  },

  vite: {
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.ngrok-free.app', 'localhost']
    },
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
    "@nuxt/image",
  ],

  runtimeConfig: {
    TELEGRAM_BOT_TOKEN: process.env.NUXT_TELEGRAM_BOT_TOKEN,
    TELEGRAM_ADMIN_CHAT_ID: process.env.NUXT_TELEGRAM_ADMIN_CHAT_ID,
    public: {
      databaseURL: process.env.NUXT_databaseURL,
      ASSETS_IMAGE_BUCKET: process.env.NUXT_ASSETS_IMAGE_BUCKET,
      SITE_URL: process.env.NUXT_SITE_URL,
      TELEGRAM_BOT_USERNAME: process.env.NUXT_TELEGRAM_BOT_USERNAME,
      gamificationFreezeEnabled: process.env.NUXT_GAMIFICATION_FREEZE_ENABLED === 'true',
      gamificationFreezeChance: parseFloat(process.env.NUXT_GAMIFICATION_FREEZE_CHANCE || '1'),
      gamificationFreezeDuration: parseInt(process.env.NUXT_GAMIFICATION_FREEZE_DURATION || '300000'),
      gamificationFreezeCommission: parseFloat(process.env.NUXT_GAMIFICATION_FREEZE_COMMISSION || '1'),
    },
  },

  experimental: {
    payloadExtraction: false,
  },

  hooks: {
    'render:html': (html) => {
      html.head.push('<meta name="renderer" content="ssr">')
    },
  },
});

export default defineEventHandler((event) => {
  // Добавляем заголовки для SSR
  setHeader(event, 'X-Powered-By', 'Nuxt 3 SSR')
  setHeader(event, 'Cache-Control', 'public, max-age=0, must-revalidate')
})

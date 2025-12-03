import { Getter } from '~/helpers/getter'

/**
 * Composable-обёртка над Getter для удобного использования в Nuxt компонентах
 * Автоматически получает DatabaseReference из Nuxt контекста
 */
export const useGetter = () => {
  const { $databaseRef } = useNuxtApp()

  return {
    getFromDB: <T = unknown>(url: string) => 
      Getter.getFromDB<T>($databaseRef, url),
    
    getByKey: <T = unknown>(db: string, key: string) => 
      Getter.getByKey<T>($databaseRef, db, key),
    
    getCountByValue: (path: string, key: string, value: string) => 
      Getter.getCountByValue($databaseRef, path, key, value),
    
    getByValue: <T = unknown>(path: string, key: string, value: string) => 
      Getter.getByValue<T>($databaseRef, path, key, value),
    
    getActiveUserTransaction: (telegramUsername: string) => 
      Getter.getActiveUserTransaction($databaseRef, telegramUsername),
  }
}

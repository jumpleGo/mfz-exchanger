import {
  child,
  get,
  query,
  equalTo,
  orderByChild
} from 'firebase/database'
import type { DatabaseReference, DataSnapshot } from '@firebase/database'

/**
 * Утилита для работы с Firebase Realtime Database
 * Все методы принимают DatabaseReference как параметр для независимости от Nuxt контекста
 */
export class Getter {
  /**
   * Получить данные по URL пути
   */
  static async getFromDB<T = unknown>(
    databaseRef: DatabaseReference,
    url: string
  ): Promise<T | null> {
    try {
      const snapshot = await get(child(databaseRef, url))
      return snapshot.exists() ? snapshot.val() as T : null
    } catch (error) {
      console.error(`Error getting data from ${url}:`, error)
      throw error
    }
  }

  /**
   * Получить данные по ключу
   */
  static async getByKey<T = unknown>(
    databaseRef: DatabaseReference,
    db: string,
    key: string
  ): Promise<T | null> {
    try {
      const snapshot = await get(child(databaseRef, `${db}/${key}`))
      return snapshot.exists() ? snapshot.val() as T : null
    } catch (error) {
      console.error(`Error getting data by key ${key} from ${db}:`, error)
      throw error
    }
  }

  /**
   * Получить количество записей по значению поля
   */
  static async getCountByValue(
    databaseRef: DatabaseReference,
    path: string,
    key: string,
    value: string
  ): Promise<number> {
    try {
      const request = query(
        child(databaseRef, path),
        orderByChild(key),
        equalTo(value)
      )
      const snapshot = await get(request)
      return snapshot.size
    } catch (error) {
      console.error(`Error counting by ${key}=${value} in ${path}:`, error)
      throw error
    }
  }

  /**
   * Получить данные по значению поля
   */
  static async getByValue<T = unknown>(
    databaseRef: DatabaseReference,
    path: string,
    key: string,
    value: string
  ): Promise<T | null> {
    try {
      const request = query(
        child(databaseRef, path),
        orderByChild(key),
        equalTo(value)
      )
      const snapshot = await get(request)
      return snapshot.exists() ? snapshot.val() as T : null
    } catch (error) {
      console.error(`Error getting by ${key}=${value} in ${path}:`, error)
      throw error
    }
  }

  /**
   * Получить последнюю активную транзакцию пользователя по telegram username
   * Активные статусы: created, done
   */
  static async getActiveUserTransaction(
    databaseRef: DatabaseReference,
    telegramUsername: string
  ): Promise<{ transaction: any; key: string } | null> {
    try {
      const request = query(
        child(databaseRef, 'transactions'),
        orderByChild('telegram'),
        equalTo(telegramUsername)
      )
      const snapshot = await get(request)
      
      if (!snapshot.exists()) {
        return null
      }

      const transactions = snapshot.val()
      
      // Фильтруем только активные транзакции (created или done)
      const activeTransactions = Object.entries(transactions)
        .map(([key, transaction]: [string, any]) => ({ key, transaction }))
        .filter(({ transaction }) => 
          transaction.status === 'created' || transaction.status === 'done'
        )

      if (activeTransactions.length === 0) {
        return null
      }

      // Сортируем по id (timestamp) и берем последнюю
      const latestTransaction = activeTransactions.sort(
        (a, b) => b.transaction.id - a.transaction.id
      )[0]

      return {
        transaction: latestTransaction.transaction,
        key: latestTransaction.key
      }
    } catch (error) {
      console.error(`Error getting active transaction for ${telegramUsername}:`, error)
      throw error
    }
  }
}
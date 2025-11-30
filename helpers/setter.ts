import { child, get, push, set, ref, getDatabase, update, increment } from 'firebase/database'
import type { DatabaseReference } from '@firebase/database'

export class Setter {
  static setToDb (url: string, data: any) {
    return set(child(ref(getDatabase()), url), data)
  }

  static async pushToDb (url: string, data: any) {
    return push(child(ref(getDatabase()), url), data)
  }


  static async updateToDb (updates: any) {
    return await update(ref(getDatabase()), updates)
  }

  static async incrementByKey (path: string, id: number | string, key: string) {
    return await update(ref(getDatabase(), `${path}/${id}`), {
      [key]: increment(1)
    } )
  }
}
import { child, remove } from 'firebase/database'

export class Remover {
  static removeFromDb (url: string) {
    const { $databaseRef, $firebase } = useNuxtApp()
    return remove(child($databaseRef, url))
  }

}
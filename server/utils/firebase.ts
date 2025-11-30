import {ref as dbRef} from "@firebase/database";
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export const useServerDatabase = () => {
  const apps = getApps()
  const app = apps.length ? apps[0] : initializeApp({
    databaseURL: process.env.databaseURL
  })

  return {
    database:  getDatabase(app),
    databaseRef: dbRef(getDatabase(app))
  }
}

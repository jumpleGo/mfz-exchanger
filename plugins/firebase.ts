import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import {ref as dbRef} from "@firebase/database";

export default defineNuxtPlugin((nuxtApp) => {

    const config : Record<string, string> = useRuntimeConfig()

    const configFirebase: {databaseURL: string} = {databaseURL: config.public.databaseURL}
    const firebase = initializeApp(configFirebase);
    const databaseRef = dbRef(getDatabase(firebase));
    const database = getDatabase(firebase)


    return {
      provide: {
        firebase,
        databaseRef,
        database
      }
    }
})

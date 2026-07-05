import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: 'AIzaSyBH4mzTioRfKokFzXfAmznnKzcPcYnhkXc',
    authDomain: 'revdex-9bdaf.firebaseapp.com',
    projectId: 'revdex-9bdaf',
    storageBucket: 'revdex-9bdaf.firebasestorage.app',
    messagingSenderId: '128986973485',
    appId: '1:128986973485:web:4953db53b040907a333fa4',
    measurementId: 'G-86N82XHSN3',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth()
export const db = getFirestore(app)
export const storage = getStorage(app)

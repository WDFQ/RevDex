import { Redirect } from 'expo-router'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import '../global.css'
import { auth } from '../services/firebase'

export default function RootLayout() {
    // user obj can either be null or User
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // runs function in param (callback) when auth changes, returns unsubscribe function
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setIsLoading(false)
        })

        return unsubscribe
    }, [])

    if (isLoading) {
        return null
    } else {
        if (user) {
            return <Redirect href={'/(tabs)'} />
        } else {
            return <Redirect href={'/(auth)/login'} />
        }
    }
}

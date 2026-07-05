import { Stack } from 'expo-router'
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

    // Keep the native splash up until we know the auth state. The root layout
    // MUST render a navigator once ready, otherwise expo-router never mounts a
    // screen and the splash screen hangs forever.
    if (isLoading) {
        return null
    } else {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                {/* render tabs if user is not null */}
                <Stack.Protected guard={user !== null}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="CameraScreen" />
                    <Stack.Screen name="CaptureCardScreen" />
                </Stack.Protected>
                {/* render auth section if no user */}
                <Stack.Protected guard={user === null}>
                    <Stack.Screen name="(auth)" />
                </Stack.Protected>
            </Stack>
        )
    }
}

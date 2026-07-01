import { Stack } from 'expo-router'

// Auth flow starts on the sign-up screen; logging in pushes on top of it.
export const unstable_settings = {
    initialRouteName: 'signup',
}

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#0a0a0a' },
            }}
        >
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
        </Stack>
    )
}

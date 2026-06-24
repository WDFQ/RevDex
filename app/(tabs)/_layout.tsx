import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1A1A2E', borderTopColor: '#262626' },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#525252',
                tabBarLabelStyle: { fontSize: 12, letterSpacing: 1, fontWeight: 'bold' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'HOME',
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="CollectionScreen"
                options={{
                    title: 'COLLECTION',
                    tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="SettingsScreen"
                options={{
                    title: 'SETTINGS',
                    tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                }}
            />
        </Tabs>
    )
}

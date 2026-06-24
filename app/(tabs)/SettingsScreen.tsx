import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'

type SettingRow = {
    icon: keyof typeof Ionicons.glyphMap
    iconBg: string
    title: string
    subtitle: string
    value?: string
}

const MAIN_SETTINGS: SettingRow[] = [
    { icon: 'person-outline', iconBg: 'bg-sky-500', title: 'Account Profile', subtitle: 'Update handle, email, and security' },
    { icon: 'notifications-outline', iconBg: 'bg-red-500', title: 'Notifications', subtitle: 'Alerts for rare spots and community' },
    { icon: 'hardware-chip-outline', iconBg: 'bg-orange-500', title: 'Recognition Sensitivity', subtitle: 'Adjust AI model confidence', value: 'High' },
]

export default function SettingsScreen() {
    const [darkTheme, setDarkTheme] = useState(true)

    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <Header />

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {/* Large title */}
                <Text className="text-white text-3xl font-bold tracking-tight px-5 mb-5">Settings</Text>

                {/* Main settings group */}
                <View className="mx-5 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden mb-8">
                    {MAIN_SETTINGS.map((row, i) => (
                        <TouchableOpacity
                            key={row.title}
                            activeOpacity={0.6}
                            className={`flex-row items-center px-4 py-3 ${i !== 0 ? 'border-t border-neutral-800' : ''}`}
                        >
                            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${row.iconBg}`}>
                                <Ionicons name={row.icon} size={18} color="#ffffff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-base">{row.title}</Text>
                                <Text className="text-neutral-500 text-xs mt-0.5">{row.subtitle}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                {row.value && <Text className="text-neutral-500 text-base">{row.value}</Text>}
                                <Ionicons name="chevron-forward" size={18} color="#525252" />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Dark theme toggle */}
                    <View className="flex-row items-center px-4 py-3 border-t border-neutral-800">
                        <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-neutral-700">
                            <Ionicons name="moon-outline" size={18} color="#f97316" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-base">Dark Theme</Text>
                            <Text className="text-neutral-500 text-xs mt-0.5">Force digital cockpit mode</Text>
                        </View>
                        <Switch
                            value={darkTheme}
                            onValueChange={setDarkTheme}
                            trackColor={{ false: '#3f3f46', true: '#22c55e' }}
                            thumbColor="#ffffff"
                            ios_backgroundColor="#3f3f46"
                        />
                    </View>
                </View>

                {/* System group */}
                <Text className="text-neutral-500 text-xs uppercase tracking-wider px-5 mb-2">System</Text>
                <View className="mx-5 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden mb-8">
                    <TouchableOpacity activeOpacity={0.6} className="flex-row items-center px-4 py-3">
                        <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-neutral-500">
                            <Ionicons name="server-outline" size={18} color="#ffffff" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-base">Clear Local Cache</Text>
                            <Text className="text-neutral-500 text-xs mt-0.5">Free up 1.2GB of image data</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Version footer */}
                <Text className="text-neutral-600 text-xs text-center">RevDex Core v2.4.1 (Build 8902)</Text>
            </ScrollView>
        </SafeAreaView>
    )
}

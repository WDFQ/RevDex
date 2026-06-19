import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3">
                <Text className="text-white text-2xl">☰</Text>
                <Text className="text-white text-lg font-bold tracking-widest">RevDex</Text>
                <View className="w-9 h-9 rounded-full bg-neutral-700" />
            </View>

            {/* Stat Cards */}
            <View className="flex-row gap-3 px-5 mt-2">
                <View className="flex-1 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                    <Text className="text-neutral-500 text-xs font-semibold tracking-wider mb-1">CURRENT STREAK</Text>
                    <Text className="text-white text-base font-bold">🔥 12 Days</Text>
                </View>
                <View className="flex-1 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
                    <Text className="text-neutral-500 text-xs font-semibold tracking-wider mb-1">LATEST SPOT</Text>
                    <Text className="text-white text-base font-bold">911 GT3 RS</Text>
                    <Text className="text-neutral-500 text-xs mt-0.5">📍 Downtown LA</Text>
                </View>
            </View>

            {/* Camera Section */}
            <View className="flex-1 items-center justify-center gap-4">
                <Text className="text-white text-xl font-semibold">Ready to Snap?</Text>
                <Text className="text-neutral-500 text-sm">Focus. Capture. Earn Rep.</Text>

                <TouchableOpacity className="w-32 h-32 rounded-full bg-neutral-900 border-2 border-neutral-700 items-center justify-center mt-2" activeOpacity={0.8}>
                    <Text className="text-5xl">📷</Text>
                </TouchableOpacity>

                <Text className="text-neutral-600 text-xs tracking-widest font-medium">TAP TO OPEN LENS</Text>
            </View>

            {/* Bottom Tab Bar */}
            <View className="flex-row border-t border-neutral-900 py-2">
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-violet-500 text-xl">⊞</Text>
                    <Text className="text-violet-500 text-xs font-bold tracking-wider">HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-neutral-600 text-xl">🚗</Text>
                    <Text className="text-neutral-600 text-xs font-semibold tracking-wider">COLLECTION</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-neutral-600 text-xl">⚙</Text>
                    <Text className="text-neutral-600 text-xs font-semibold tracking-wider">SETTINGS</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <Header />

            {/* Stat Cards */}
            <View className="flex-row gap-3 px-5 mt-3">
                <View className="flex-1 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 justify-between" style={{ minHeight: 100 }}>
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="flame-outline" size={16} color="#f97316" />
                        <Text className="text-neutral-400 text-xs font-semibold tracking-wider">CURRENT STREAK</Text>
                    </View>
                    <Text className="text-white text-2xl font-bold mt-3">12 Days</Text>
                </View>
                <View className="flex-1 bg-neutral-800 rounded-2xl p-5 border border-neutral-700 justify-between" style={{ minHeight: 100 }}>
                    <Text className="text-neutral-400 text-xs font-semibold tracking-wider">LATEST SPOT</Text>
                    <View className="mt-3">
                        <Text className="text-white text-lg font-bold">911 GT3 RS</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                            <Ionicons name="location-outline" size={12} color="#a3a3a3" />
                            <Text className="text-neutral-400 text-xs">Downtown LA</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Camera Section */}
            <View className="flex-1 items-center justify-center gap-6">
                <View className="items-center gap-2">
                    <Text className="text-white text-xl font-semibold">Ready to Snap?</Text>
                    <Text className="text-neutral-500 text-sm">Focus. Capture. Earn Rep.</Text>
                </View>

                <TouchableOpacity
                    className="rounded-full bg-sky-200 items-center justify-center"
                    style={{ width: 180, height: 180, shadowColor: '#bae6fd', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="camera-outline" size={72} color="#0c4a6e" />
                </TouchableOpacity>

                <Text className="text-neutral-600 text-xs tracking-widest font-medium">TAP TO OPEN LENS</Text>
            </View>
        </SafeAreaView>
    )
}

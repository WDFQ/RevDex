import { Text, View } from 'react-native'

export default function Header() {
    return (
        <View className="flex-row items-center justify-between px-5 py-4">
            {/* <Ionicons name="menu" size={26} color="#ffffff" /> */}
            <Text className="text-white text-lg font-bold tracking-widest">RevDex</Text>
            <View className="w-9 h-9 rounded-full bg-neutral-700" />
        </View>
    )
}

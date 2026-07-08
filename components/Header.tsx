import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Header() {
    const [menuVisible, setMenuVisible] = useState(false)
    const insets = useSafeAreaInsets()

    const handleLogout = () => {
        setMenuVisible(false)
        // TODO: add logout logic here
    }

    return (
        <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-white text-lg font-bold tracking-widest">RevDex</Text>

            <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-full bg-neutral-700" />
            </TouchableOpacity>

            {/* Profile popup menu */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                {/* Tap anywhere outside the card to dismiss */}
                <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
                    <View
                        className="absolute right-5 bg-neutral-900 border border-neutral-800 rounded-xl py-1 min-w-[160px]"
                        style={{ top: insets.top + 56 }}
                    >
                        <TouchableOpacity
                            onPress={handleLogout}
                            activeOpacity={0.6}
                            className="flex-row items-center gap-2.5 px-4 py-3"
                        >
                            <Ionicons name="log-out-outline" size={18} color="#f87171" />
                            <Text className="text-red-400 text-base font-medium">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    )
}

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CaptureCardScreen() {
    const router = useRouter()
    const [modelName, setModelName] = useState('Porsche 911 GT3 RS')
    const [fieldNotes, setFieldNotes] = useState(
        'Caught this beauty leaving the casino. The Weissach package carbon fiber looks incredible under the streetlights. Exhaust note was deafening.'
    )

    return (
        <SafeAreaView className="flex-1 bg-neutral-950" edges={['top']}>
            {/* Top nav */}
            <View className="flex-row items-center justify-between px-4 h-12">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 -ml-2 rounded-full items-center justify-center"
                    activeOpacity={0.6}
                >
                    <Ionicons name="chevron-back" size={26} color="#38bdf8" />
                </TouchableOpacity>
                <Text className="text-white text-base font-semibold">Spot Details</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {/* Hero image */}
                <View className="w-full h-72 bg-neutral-800 relative items-center justify-center">
                    <Ionicons name="car-sport-outline" size={64} color="#525252" />

                    {/* Rarity tag */}
                    <View className="absolute bottom-4 left-5">
                        <View className="flex-row items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full">
                            <Ionicons name="diamond-outline" size={14} color="#eab308" />
                            <Text className="text-neutral-900 text-sm font-semibold">Exotic</Text>
                        </View>
                    </View>

                    {/* Production tag */}
                    <View className="absolute bottom-4 right-5">
                        <View className="bg-black/60 px-3 py-1.5 rounded-full flex-row items-center">
                            <Text className="text-white/80 text-[11px] uppercase tracking-wider mr-1">Production</Text>
                            <Text className="text-white text-sm font-semibold">1 of 500</Text>
                        </View>
                    </View>
                </View>

                {/* Details group */}
                <View className="px-5 pt-4">
                    <View className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                        {/* Model designation */}
                        <View className="p-4 border-b border-neutral-800">
                            <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                Model Designation
                            </Text>
                            <TextInput
                                value={modelName}
                                onChangeText={setModelName}
                                placeholder="Enter model name"
                                placeholderTextColor="#737373"
                                className="text-white text-xl font-semibold p-0"
                            />
                        </View>

                        {/* Metadata row */}
                        <View className="flex-row border-b border-neutral-800">
                            <View className="flex-1 p-4">
                                <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                    Spotted Location
                                </Text>
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons name="location-outline" size={16} color="#38bdf8" />
                                    <Text className="text-white text-base" numberOfLines={1}>
                                        Monaco Grand Prix Circuit
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row border-b border-neutral-800">
                            <View className="flex-1 p-4">
                                <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                    Capture Date
                                </Text>
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons name="calendar-outline" size={16} color="#38bdf8" />
                                    <Text className="text-white text-base">24.05.2023</Text>
                                </View>
                            </View>
                        </View>

                        {/* Field notes */}
                        <View className="p-4">
                            <Text className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-2">
                                Field Notes
                            </Text>
                            <TextInput
                                value={fieldNotes}
                                onChangeText={setFieldNotes}
                                placeholder="Add details about the spec, exhaust note, or scenario..."
                                placeholderTextColor="#737373"
                                multiline
                                className="text-white text-base p-0"
                                style={{ minHeight: 88, textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom action zone */}
            <View className="flex-row items-center gap-3 px-5 py-3 border-t border-neutral-800">
                <TouchableOpacity
                    className="w-12 h-12 rounded-full border border-sky-400/30 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-outline" size={20} color="#38bdf8" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 h-12 bg-sky-500 rounded-xl items-center justify-center"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-base font-semibold">Save Changes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

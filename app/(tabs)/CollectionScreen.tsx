import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CarCard from '../../components/CarCard'
import Header from '../../components/Header'

const PLACEHOLDER_CARS = [
    { id: '1', carName: 'Porsche 911 GT3', date: 'Oct 24', location: 'Los Angeles', rarity: 'epic' as const, color: '#1c1c1e' },
    { id: '2', carName: 'Lambo Huracán', date: 'Sep 12', location: 'New York City', rarity: 'rare' as const, color: '#111827' },
    { id: '3', carName: 'BMW M4 Comp', date: 'Sep 05', location: 'Miami', rarity: 'common' as const, color: '#18181b' },
    { id: '4', carName: 'Ferrari Roma', date: 'Aug 28', location: 'San Francisco', rarity: 'uncommon' as const, color: '#1f1f23' },
    { id: '5', carName: 'McLaren 720S', date: 'Aug 10', location: 'Chicago', rarity: 'epic' as const, color: '#161618' },
]

const FILTERS = ['All Spots', 'Epic', 'Rare']

export default function CollectionScreen() {
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <Header />

            {/* Search bar */}
            <View className="flex-row items-center gap-3 px-5 mb-3">
                <View className="flex-1 flex-row items-center bg-neutral-900 border border-neutral-800 rounded-xl px-3 h-10 gap-2">
                    <Text className="text-neutral-500 text-base">🔍</Text>
                    <TextInput
                        placeholder="Search collection..."
                        placeholderTextColor="#737373"
                        className="flex-1 text-white text-sm"
                    />
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 items-center justify-center">
                    <Text className="text-neutral-400 text-base">⇅</Text>
                </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <View className="flex-row gap-2 px-5 mb-4">
                {FILTERS.map((filter, i) => (
                    <TouchableOpacity
                        key={filter}
                        className={`px-4 py-1.5 rounded-full border ${i === 0 ? 'bg-sky-500 border-sky-500' : 'bg-transparent border-neutral-700'}`}
                    >
                        <Text className={`text-xs font-semibold ${i === 0 ? 'text-white' : 'text-neutral-400'}`}>
                            {i !== 0 && '● '}{filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Car grid */}
            <FlatList
                data={PLACEHOLDER_CARS}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
                renderItem={({ item }) => (
                    <CarCard
                        carName={item.carName}
                        date={item.date}
                        location={item.location}
                        rarity={item.rarity}
                        placeholderColor={item.color}
                    />
                )}
            />

            {/* Bottom Tab Bar */}
            <View className="flex-row border-t border-neutral-800 py-3">
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-neutral-600 text-xl">⊞</Text>
                    <Text className="text-neutral-600 text-xs font-semibold tracking-wider">HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-white text-xl">🚗</Text>
                    <Text className="text-white text-xs font-bold tracking-wider">COLLECTION</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 items-center gap-1">
                    <Text className="text-neutral-600 text-xl">⚙</Text>
                    <Text className="text-neutral-600 text-xs font-semibold tracking-wider">SETTINGS</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

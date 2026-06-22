import { Text, View } from 'react-native'

type Rarity = 'epic' | 'rare' | 'common' | 'uncommon'

type CarCardProps = {
    carName: string
    date: string
    location: string
    rarity: Rarity
    placeholderColor?: string
}

const RARITY_STYLES: Record<Rarity, { badge: string; text: string }> = {
    epic: { badge: 'bg-purple-600', text: 'EPIC' },
    rare: { badge: 'bg-blue-500', text: 'RARE' },
    uncommon: { badge: 'bg-green-500', text: 'UNCOMMON' },
    common: { badge: 'bg-neutral-500', text: 'COMMON' },
}

export default function CarCard({ carName, date, location, rarity, placeholderColor = '#27272a' }: CarCardProps) {
    const { badge, text } = RARITY_STYLES[rarity]

    return (
        <View className="flex-1 m-1.5 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
            {/* Photo placeholder */}
            <View className="w-full aspect-square relative" style={{ backgroundColor: placeholderColor }}>
                <View className={`absolute top-2 right-2 px-2 py-0.5 rounded-full ${badge}`}>
                    <Text className="text-white text-xs font-bold tracking-wider">{text}</Text>
                </View>
            </View>

            {/* Info */}
            <View className="px-2.5 py-2">
                <Text className="text-white font-bold text-sm" numberOfLines={1}>{carName}</Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-neutral-500 text-xs">{date}</Text>
                    <Text className="text-neutral-600 text-xs">•</Text>
                    <Text className="text-sky-400 text-xs">{location}</Text>
                </View>
            </View>
        </View>
    )
}

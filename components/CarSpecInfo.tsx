import { Text, View } from 'react-native'

type Details = {
    make: string | null
    model: string | null
    years: string | null
    confidence: string
    notes: string | null
    time: string | null
}

export function CarSpecInfo({ make, model, years, confidence, notes, time }: Details) {
    return (
        <View className="mx-6 mt-4 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-neutral-800">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Make</Text>
                <Text className="text-white text-xl font-semibold">{make ?? 'Unknown'}</Text>
            </View>
            <View className="p-4 border-b border-neutral-800">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Model</Text>
                <Text className="text-white text-xl font-semibold">{model ?? 'Unknown'}</Text>
            </View>
            <View className="flex-row border-b border-neutral-800">
                <View className="flex-1 p-4 border-r border-neutral-800">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Years</Text>
                    <Text className="text-white text-base">{years ?? 'Unknown'}</Text>
                </View>
                <View className="flex-1 p-4">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Confidence</Text>
                    <Text className="text-white text-base capitalize">{confidence}</Text>
                </View>
            </View>
            <View className="p-4 border-b border-neutral-800">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Notes</Text>
                <Text className="text-neutral-300 text-sm leading-5">{notes ?? 'No notes available.'}</Text>
            </View>
            <View className="p-4">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Spotted</Text>
                <Text className="text-neutral-300 text-sm">{time ?? 'Unknown'}</Text>
            </View>
        </View>
    )
}

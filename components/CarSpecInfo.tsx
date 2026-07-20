type Details = {
    make: string
    model: string
    years: string
    confidence: string
    notes: string
}

export function CarSpecInfo({ make, model, years, confidence, notes }: Details) {
    return (
        <View className="mx-6 mt-4 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-neutral-800">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Make</Text>
                <Text className="text-white text-xl font-semibold">{}</Text>
            </View>
            <View className="p-4 border-b border-neutral-800">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Model</Text>
                <Text className="text-white text-xl font-semibold">{}</Text>
            </View>
            <View className="flex-row border-b border-neutral-800">
                <View className="flex-1 p-4 border-r border-neutral-800">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Years</Text>
                    <Text className="text-white text-base">{}</Text>
                </View>
                <View className="flex-1 p-4">
                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Confidence</Text>
                    <Text className="text-white text-base capitalize">{}</Text>
                </View>
            </View>
            <View className="p-4">
                <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Notes</Text>
                <Text className="text-neutral-300 text-sm leading-5">{}</Text>
            </View>
        </View>
    )
}

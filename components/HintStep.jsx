export default function HintStep({ hintText, onHintTextChange, onBack, onContinue }) {
    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center h-14 px-2">
                <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="w-10 h-10 items-center justify-center">
                    <Ionicons name="chevron-back" size={26} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <Pressable className="flex-1" onPress={Keyboard.dismiss} />

            <View className="bg-neutral-900 border border-neutral-800 rounded-2xl mx-4 mb-4 p-5">
                <Text className="text-white text-xl font-bold mb-1">Anything we should know?</Text>
                <Text className="text-neutral-400 text-sm mb-4">Optional — a small hint can help identify the car.</Text>
                <TextInput
                    value={hintText}
                    onChangeText={onHintTextChange}
                    placeholder={'e.g. "has a body kit", "badge says Alpine", "the car in the back is a WRX"'}
                    placeholderTextColor="#525252"
                    multiline
                    className="bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-base p-4 mb-4"
                    style={{ minHeight: 88, textAlignVertical: 'top' }}
                />
                <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center" onPress={onContinue}>
                    <Text className="text-sky-900 text-base font-semibold">Continue</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

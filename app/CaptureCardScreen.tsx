import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

function buildIdentificationPrompt(userHint: string): string {
    let prompt =
        'You are identifying cars for a car-spotting app. ' +
        'List EVERY distinct car visible in this photo, ordered by prominence: ' +
        'the largest, closest, or most centered car first.\n\n' +
        'For each car, give the make, model, and a year range when you can actually tell. ' +
        'The yearRange must ALWAYS be a span (for example "2016–2019" or "2018–2021"), normally the ' +
        "car's generation or production years — never a single model year, even when you feel confident " +
        'about the exact year.\n\n' +
        'Also write a description of exactly two sentences about this specific car: what it is and ' +
        'something notable about the model, its era, or what is visible in the photo. Keep it factual ' +
        'and enthusiast-toned. If you cannot identify the car, still describe what you can see in two ' +
        'sentences (for example body style, colour, and why it is hard to identify).\n\n' +
        'Honesty about uncertainty matters more than being helpful here. A confident wrong answer is ' +
        'worse for this app than an honest "not sure". Follow these rules:\n' +
        '- Only use "high" confidence when the make and model are clearly legible or unambiguous, ' +
        'for example visible badging or an unmistakable body shape.\n' +
        '- Readily use "medium" or "low" confidence when the car is blurry, obscured, at a bad angle, ' +
        'generic-looking, or a rare model you are genuinely unsure about.\n' +
        '- Prefer null for make, model, or yearRange over fabricating a plausible-sounding guess when you ' +
        'are not reasonably sure.\n' +
        'Behave like a knowledgeable but honest car enthusiast, not one that makes up specific ' +
        'answers to seem helpful.'

    const trimmedHint = userHint.trim()
    if (trimmedHint) {
        prompt += '\n\nThe user added this hint about the photo: "' + trimmedHint + '". Take it into account, but still verify it against what you can actually see.'
    }

    return prompt
}

async function requestCarIdentification(base64Image: string, userHint: string) {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set — add it to your .env file')
    }

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: buildIdentificationPrompt(userHint) }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }],
                },
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        carsDetected: { type: 'INTEGER' },
                        cars: {
                            type: 'ARRAY',
                            maxItems: 5,
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    make: { type: 'STRING', nullable: true },
                                    model: { type: 'STRING', nullable: true },
                                    yearRange: { type: 'STRING', nullable: true },
                                    description: { type: 'STRING', nullable: true },
                                    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
                                },
                                required: ['confidence'],
                                propertyOrdering: ['make', 'model', 'yearRange', 'description', 'confidence'],
                            },
                        },
                    },
                    required: ['carsDetected', 'cars'],
                    propertyOrdering: ['carsDetected', 'cars'],
                },
            },
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Gemini request failed with status ${response.status}: ${errorBody}`)
    }

    const responseJson = await response.json()
    // Gemini returns the structured JSON as a text part; parse it into our result shape.
    const resultText = responseJson.candidates[0].content.parts[0].text
    return JSON.parse(resultText)
}

export default function CaptureCardScreen() {
    type screenStatus = 'hint' | 'loading' | 'error' | 'result'

    const [userHintText, setUserHintText] = useState('')
    // start the status on hint for user hint
    const [appStatus, setAppStatus] = useState('hint')

    // get photo passed from camera screen
    const { imageUri, capturedAt } = useLocalSearchParams()
    const photoUri = String(imageUri)
    const capturedAtData = capturedAt ? String(capturedAt) : ''

    // make capture data useable as a regular readable string
    const dateObj = new Date(capturedAtData).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

    return (
        <View className="flex-1 bg-neutral-950">
            {/* Photo background — always rendered, sits behind everything */}
            <Image source={{ uri: photoUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />

            {/* Dim layers — outside SafeAreaView, so they cover the true screen edges */}
            {appStatus === 'hint' ? <View className="absolute inset-0 bg-black/40" /> : null}
            {appStatus === 'analyzing' ? <View className="absolute inset-0 bg-black/70" /> : null}

            {/* Visible content — inside SafeAreaView, so it avoids the notch/home indicator */}
            <SafeAreaView className="flex-1">
                {appStatus === 'hint' ? (
                    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View className="flex-row items-center h-14 px-2">
                            <TouchableOpacity activeOpacity={0.7} className="w-10 h-10 items-center justify-center">
                                <Ionicons name="chevron-back" size={26} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        <Pressable className="flex-1" onPress={Keyboard.dismiss} />

                        <View className="bg-neutral-900 border border-neutral-800 rounded-2xl mx-4 mb-4 p-5">
                            <Text className="text-white text-xl font-bold mb-1">Anything we should know?</Text>
                            <Text className="text-neutral-400 text-sm mb-4">Optional — a small hint can help identify the car.</Text>
                            <TextInput
                                value={userHintText}
                                onChangeText={setUserHintText}
                                placeholder={'e.g. "has a body kit", "badge says Alpine", "the car in the back is a WRX"'}
                                placeholderTextColor="#525252"
                                multiline
                                className="bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-base p-4 mb-4"
                                style={{ minHeight: 88, textAlignVertical: 'top' }}
                            />
                            <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center" onPress={handleContinuePress}>
                                <Text className="text-sky-900 text-base font-semibold">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                ) : null}

                {appStatus === 'analyzing' ? (
                    <View className="flex-1 items-center justify-center gap-4">
                        <ActivityIndicator size="large" color="#bae6fd" />
                        <Text className="text-white text-base font-semibold">Identifying your car...</Text>
                    </View>
                ) : null}
            </SafeAreaView>
        </View>
    )
}

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import HintStep from '../components/HintStep'

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
    // gets relevant json part (.text is the string version of the json object with shape defined above)
    const resultText = responseJson.candidates[0].content.parts[0].text
    return JSON.parse(resultText)
}

export default function CaptureCardScreen() {
    const [userHintText, setUserHintText] = useState('')
    // start the status on hint for user hint states: (error, hint, result, loading)
    const [appStatus, setAppStatus] = useState('hint')

    // get photo passed from camera screen
    const { imageUri, capturedAt } = useLocalSearchParams()
    const photoUri = String(imageUri)
    const capturedAtData = capturedAt ? String(capturedAt) : ''

    // make capture data useable as a regular readable string
    const dateObj = new Date(capturedAtData).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

    // clicked when user wishes to proceed
    function hintStepContinueBtn() {
        // call gemini and get response
        const result = requestCarIdentification(photoUri, userHintText)

        // render result page and data

        setAppStatus('result')
    }

    return (
        <View className="flex-1 bg-neutral-950">
            {/* Photo background — always rendered, sits behind everything */}
            <Image source={{ uri: photoUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />

            {/* Dim layers — outside SafeAreaView, so they cover the true screen edges */}
            {appStatus === 'hint' ? <View className="absolute inset-0 bg-black/40" /> : null}
            {appStatus === 'loading' ? <View className="absolute inset-0 bg-black/70" /> : null}

            {/* render result when states change to 'result */}
            {appStatus === 'result' ? (
                <SafeAreaView className="flex-1 bg-neutral-950" edges={['top', 'bottom']}>
                    {/* Top bar */}
                    <View className="flex-row items-center h-14 px-2 border-b border-neutral-800">
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setAppStatus('hint')} className="w-10 h-10 items-center justify-center">
                            <Ionicons name="chevron-back" size={26} color="#38bdf8" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-white text-base font-semibold text-center">Spot Details</Text>
                        <View className="w-10 h-10" />
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Photo hero */}
                        <Image source={{ uri: photoUri }} className="w-full h-72" resizeMode="cover" />

                        {/* Grouped detail card */}
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
                    </ScrollView>

                    {/* Fixed action bar */}
                    <View className="flex-row items-center gap-3 px-6 pt-3 border-t border-neutral-800">{/* ...unchanged... */}</View>
                </SafeAreaView>
            ) : (
                // render the hint or loading step if not on result
                <SafeAreaView className="flex-1">
                    {appStatus === 'hint' ? (
                        <HintStep hintText={userHintText} onHintTextChange={setUserHintText} onBack={() => router.replace('/')} onContinue={hintStepContinueBtn} />
                    ) : null}

                    {appStatus === 'loading' ? (
                        <View className="flex-1 items-center justify-center gap-4">
                            <ActivityIndicator size="large" color="#bae6fd" />
                            <Text className="text-white text-base font-semibold">Identifying your car...</Text>
                        </View>
                    ) : null}
                </SafeAreaView>
            )}
        </View>
    )
}

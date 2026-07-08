import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system/legacy'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// The screen moves through these steps in order. The error step loops back to 'hint'.
type ScreenStatus = 'hint' | 'analyzing' | 'error' | 'result'

type CarConfidence = 'high' | 'medium' | 'low'

type DetectedCar = {
    make: string | null
    model: string | null
    year: string | null
    confidence: CarConfidence
}

type IdentificationResult = {
    carsDetected: number
    cars: DetectedCar[]
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

function buildIdentificationPrompt(userHint: string): string {
    let prompt =
        'You are identifying cars for a car-spotting app. ' +
        'List EVERY distinct car visible in this photo, ordered by prominence: ' +
        'the largest, closest, or most centered car first.\n\n' +
        'For each car, give the make, model, and year (or year range) when you can actually tell.\n\n' +
        'Honesty about uncertainty matters more than being helpful here. A confident wrong answer is ' +
        'worse for this app than an honest "not sure". Follow these rules:\n' +
        '- Only use "high" confidence when the make and model are clearly legible or unambiguous, ' +
        'for example visible badging or an unmistakable body shape.\n' +
        '- Readily use "medium" or "low" confidence when the car is blurry, obscured, at a bad angle, ' +
        'generic-looking, or a rare model you are genuinely unsure about.\n' +
        '- Prefer null for make, model, or year over fabricating a plausible-sounding guess when you ' +
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
                                    year: { type: 'STRING', nullable: true },
                                    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
                                },
                                required: ['confidence'],
                                propertyOrdering: ['make', 'model', 'year', 'confidence'],
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
    return JSON.parse(resultText) as IdentificationResult
}

function getCarPillLabel(car: DetectedCar, carIndex: number): string {
    const nameParts: string[] = []
    if (car.make) {
        nameParts.push(car.make)
    }
    if (car.model) {
        nameParts.push(car.model)
    }
    if (nameParts.length === 0) {
        return `Car ${carIndex + 1}`
    }
    return nameParts.join(' ')
}

function displayOrUnknown(value: string | null): string {
    if (value) {
        return value
    }
    return 'Unknown'
}

export default function CaptureCardScreen() {
    const router = useRouter()
    const { imageUri } = useLocalSearchParams()
    // The camera screen always passes a single uri, but route params are typed string | string[].
    const photoUri = String(imageUri)

    const [status, setStatus] = useState<ScreenStatus>('hint')
    const [hintText, setHintText] = useState('')
    const [detectedCars, setDetectedCars] = useState<DetectedCar[]>([])
    const [selectedCarIndex, setSelectedCarIndex] = useState(0)
    const [showMultipleCarsToast, setShowMultipleCarsToast] = useState(false)

    // Auto-dismiss the "multiple cars" banner after 3.5 seconds.
    useEffect(() => {
        if (!showMultipleCarsToast) {
            return
        }
        const dismissTimer = setTimeout(() => setShowMultipleCarsToast(false), 3500)
        return () => clearTimeout(dismissTimer)
    }, [showMultipleCarsToast])

    async function handleContinuePress() {
        Keyboard.dismiss()
        setStatus('analyzing')

        try {
            // Read the photo from local cache and convert it to base64 for the API.
            const base64Image = await FileSystem.readAsStringAsync(photoUri, {
                encoding: FileSystem.EncodingType.Base64,
            })

            const identification = await requestCarIdentification(base64Image, hintText)

            if (identification.carsDetected === 0 || identification.cars.length === 0) {
                setStatus('error')
                return
            }

            setDetectedCars(identification.cars)
            setSelectedCarIndex(0)
            if (identification.cars.length > 1) {
                setShowMultipleCarsToast(true)
            }
            setStatus('result')
        } catch (error) {
            // console.log instead of console.error so a handled failure doesn't open the redbox.
            console.log('Car identification failed:', error)
            setStatus('error')
        }
    }

    function handleTryAgainPress() {
        // Return to the hint step with a clean slate so we never show stale results.
        setDetectedCars([])
        setSelectedCarIndex(0)
        setShowMultipleCarsToast(false)
        setStatus('hint')
    }

    function handleAddToGaragePress() {
        // TODO: save the selected car to Firestore.
    }

    const selectedCar = detectedCars[selectedCarIndex]

    return (
        <View className="flex-1 bg-neutral-950">
            {/* Captured photo as the full-screen background for every step */}
            <Image source={{ uri: photoUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />

            {/* Full-screen dim layers, outside the safe area so they cover the whole photo */}
            {status === 'hint' && <View className="absolute inset-0 bg-black/40" />}
            {status === 'analyzing' && (
                <View className="absolute inset-0 bg-black/70 items-center justify-center gap-4">
                    <ActivityIndicator size="large" color="#bae6fd" />
                    <Text className="text-white text-base font-semibold">Identifying your car...</Text>
                </View>
            )}
            {(status === 'error' || status === 'result') && <View className="absolute inset-0 bg-black/60" />}

            <SafeAreaView className="flex-1">
                {/* ---- Step 1: optional hint ---- */}
                {status === 'hint' && (
                    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        {/* Empty area above the card; tapping it dismisses the keyboard */}
                        <Pressable className="flex-1" onPress={Keyboard.dismiss} />

                        <View className="bg-neutral-900 border border-neutral-800 rounded-2xl mx-4 mb-4 p-5">
                            <Text className="text-white text-xl font-bold mb-1">Anything we should know?</Text>
                            <Text className="text-neutral-400 text-sm mb-4">Optional — a small hint can help identify the car.</Text>
                            <TextInput
                                value={hintText}
                                onChangeText={setHintText}
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
                )}

                {/* ---- Step 3: nothing identified / request failed ---- */}
                {status === 'error' && (
                    <View className="flex-1 justify-center px-6">
                        <View className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 items-center">
                            <Ionicons name="alert-circle-outline" size={40} color="#737373" />
                            <Text className="text-white text-lg font-bold mt-3 mb-1 text-center">Couldn't identify a car in that photo.</Text>
                            <Text className="text-neutral-400 text-sm text-center mb-5">Try adding a hint, or retake the photo with the car more visible.</Text>
                            <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center w-full" onPress={handleTryAgainPress}>
                                <Text className="text-sky-900 text-base font-semibold">Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ---- Step 4: results ---- */}
                {status === 'result' && selectedCar && (
                    <View className="flex-1 justify-end">
                        <View className="mx-4 mb-4">
                            {/* Car selector pills — only when more than one car was detected */}
                            {detectedCars.length > 1 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 8 }}>
                                    {detectedCars.map((car, carIndex) => {
                                        const isSelected = carIndex === selectedCarIndex
                                        return (
                                            <TouchableOpacity
                                                key={carIndex}
                                                activeOpacity={0.7}
                                                onPress={() => setSelectedCarIndex(carIndex)}
                                                className={isSelected ? 'bg-sky-200 rounded-full px-4 py-2' : 'bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2'}
                                            >
                                                <Text className={isSelected ? 'text-sky-900 text-sm font-semibold' : 'text-white text-sm font-semibold'}>
                                                    {getCarPillLabel(car, carIndex)}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>
                            )}

                            {/* Selected car details */}
                            <View className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden mb-3">
                                <View className="p-4 border-b border-neutral-800">
                                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Make</Text>
                                    <Text className="text-white text-xl font-semibold">{displayOrUnknown(selectedCar.make)}</Text>
                                </View>
                                <View className="p-4 border-b border-neutral-800">
                                    <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Model</Text>
                                    <Text className="text-white text-xl font-semibold">{displayOrUnknown(selectedCar.model)}</Text>
                                </View>
                                <View className="flex-row">
                                    <View className="flex-1 p-4 border-r border-neutral-800">
                                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Year</Text>
                                        <Text className="text-white text-base">{displayOrUnknown(selectedCar.year)}</Text>
                                    </View>
                                    <View className="flex-1 p-4">
                                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Confidence</Text>
                                        <Text className="text-white text-base capitalize">{selectedCar.confidence}</Text>
                                    </View>
                                </View>
                                {selectedCar.confidence === 'low' && (
                                    <View className="flex-row items-center gap-1.5 px-4 pb-3">
                                        <Ionicons name="help-circle-outline" size={14} color="#a3a3a3" />
                                        <Text className="text-neutral-400 text-xs">Unconfirmed — double-check this one before saving.</Text>
                                    </View>
                                )}
                            </View>

                            {/* Actions */}
                            <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center mb-3" onPress={handleAddToGaragePress}>
                                <Text className="text-sky-900 text-base font-semibold">Add to Garage</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} className="bg-neutral-900 border border-neutral-800 rounded-2xl py-4 items-center" onPress={() => router.back()}>
                                <Text className="text-white text-base font-semibold">Retake Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Multiple-cars toast — rendered last so it sits on top */}
                {showMultipleCarsToast && (
                    <View className="absolute top-4 left-5 right-5 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                        <Ionicons name="information-circle-outline" size={18} color="#38bdf8" />
                        <Text className="text-white text-sm flex-1">Multiple cars detected — select the desired car below</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    )
}

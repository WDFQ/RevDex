import { Ionicons } from '@expo/vector-icons'
import { File } from 'expo-file-system'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// The screen moves through these steps in order. The error step loops back to 'hint'.
type ScreenStatus = 'hint' | 'analyzing' | 'error' | 'result'

type CarConfidence = 'high' | 'medium' | 'low'

type DetectedCar = {
    make: string | null
    model: string | null
    // Always a span (e.g. "2016–2019"), never a single model year — see buildIdentificationPrompt.
    yearRange: string | null
    // Two short sentences about the car, shown as notes on the capture card.
    description: string | null
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

// Format the capture timestamp (ISO string) as a short, readable date like "Jul 12, 2026".
function formatCaptureDate(isoDate: string): string {
    if (!isoDate) {
        return 'Unknown'
    }
    const parsed = new Date(isoDate)
    if (isNaN(parsed.getTime())) {
        return 'Unknown'
    }
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// The result step — modelled on the Stitch "Car Details (iOS)" screen: a photo hero at the top,
// an iOS-style grouped detail card, and a fixed action bar at the bottom.
type IdentifiedCarViewProps = {
    photoUri: string
    cars: DetectedCar[]
    selectedIndex: number
    // Photo-level capture metadata, shared across every detected car.
    capturedAt: string
    onSelectCar: (carIndex: number) => void
    onEditHint: () => void
    onRetake: () => void
    onAddToGarage: () => void
}

function IdentifiedCarView({ photoUri, cars, selectedIndex, capturedAt, onSelectCar, onEditHint, onRetake, onAddToGarage }: IdentifiedCarViewProps) {
    const selectedCar = cars[selectedIndex]
    const hasMultipleCars = cars.length > 1

    return (
        <SafeAreaView className="flex-1 bg-neutral-950" edges={['top', 'bottom']}>
            {/* Top navigation bar — back returns to the hint step to refine and re-identify */}
            <View className="flex-row items-center h-14 px-2 border-b border-neutral-800">
                <TouchableOpacity activeOpacity={0.7} onPress={onEditHint} className="w-10 h-10 items-center justify-center">
                    <Ionicons name="chevron-back" size={26} color="#38bdf8" />
                </TouchableOpacity>
                <Text className="flex-1 text-white text-base font-semibold text-center">Spot Details</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Photo hero */}
                <Image source={{ uri: photoUri }} className="w-full h-72" resizeMode="cover" />

                {/* Car selector bar — only when the photo has more than one car */}
                {hasMultipleCars && (
                    <View className="px-6 pt-4">
                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-2">{cars.length} cars detected</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {cars.map((car, carIndex) => {
                                const isSelected = carIndex === selectedIndex
                                return (
                                    <TouchableOpacity
                                        key={carIndex}
                                        activeOpacity={0.7}
                                        onPress={() => onSelectCar(carIndex)}
                                        className={isSelected ? 'bg-sky-200 rounded-full px-4 py-2' : 'bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2'}
                                    >
                                        <Text className={isSelected ? 'text-sky-900 text-sm font-semibold' : 'text-white text-sm font-semibold'}>
                                            {getCarPillLabel(car, carIndex)}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Grouped detail card (iOS settings style): rows split by dividers */}
                <View className="mx-6 mt-4 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <View className="p-4 border-b border-neutral-800">
                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Make</Text>
                        <Text className="text-white text-xl font-semibold">{displayOrUnknown(selectedCar.make)}</Text>
                    </View>
                    <View className="p-4 border-b border-neutral-800">
                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Model</Text>
                        <Text className="text-white text-xl font-semibold">{displayOrUnknown(selectedCar.model)}</Text>
                    </View>
                    <View className="flex-row border-b border-neutral-800">
                        <View className="flex-1 p-4 border-r border-neutral-800">
                            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Years</Text>
                            <View className="flex-row items-center gap-1.5">
                                <Ionicons name="time-outline" size={16} color="#38bdf8" />
                                <Text className="text-white text-base">{displayOrUnknown(selectedCar.yearRange)}</Text>
                            </View>
                        </View>
                        <View className="flex-1 p-4">
                            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Confidence</Text>
                            <View className="flex-row items-center gap-1.5">
                                <Ionicons name="ribbon-outline" size={16} color="#38bdf8" />
                                <Text className="text-white text-base capitalize">{selectedCar.confidence}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Photo capture date, read from the photo's own EXIF metadata */}
                    <View className="p-4 border-b border-neutral-800">
                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Capture Date</Text>
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="calendar-outline" size={16} color="#38bdf8" />
                            <Text className="text-white text-base">{formatCaptureDate(capturedAt)}</Text>
                        </View>
                    </View>

                    {/* Two-sentence AI description */}
                    <View className="p-4">
                        <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Notes</Text>
                        <Text className="text-neutral-300 text-sm leading-5">{displayOrUnknown(selectedCar.description)}</Text>
                    </View>

                    {selectedCar.confidence === 'low' && (
                        <View className="flex-row items-center gap-1.5 p-4 border-t border-neutral-800">
                            <Ionicons name="help-circle-outline" size={14} color="#a3a3a3" />
                            <Text className="text-neutral-400 text-xs flex-1">Unconfirmed — double-check this one before saving.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed action bar */}
            <View className="flex-row items-center gap-3 px-6 pt-3 border-t border-neutral-800">
                <TouchableOpacity activeOpacity={0.7} onPress={onRetake} className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl items-center justify-center">
                    <Ionicons name="camera-outline" size={22} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.85} onPress={onAddToGarage} className="flex-1 bg-sky-200 rounded-2xl py-4 items-center">
                    <Text className="text-sky-900 text-base font-semibold">Add to Garage</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default function CaptureCardScreen() {
    const router = useRouter()
    const { imageUri, capturedAt } = useLocalSearchParams()
    // The camera and home screens always pass single strings, but route params are typed string | string[].
    const photoUri = String(imageUri)
    // Read from the photo's own EXIF data by both the camera and upload flows; '' if the photo has none.
    const capturedAtIso = capturedAt ? String(capturedAt) : ''

    const [status, setStatus] = useState<ScreenStatus>('hint')
    const [hintText, setHintText] = useState('')
    const [detectedCars, setDetectedCars] = useState<DetectedCar[]>([])
    const [selectedCarIndex, setSelectedCarIndex] = useState(0)

    async function handleContinuePress() {
        Keyboard.dismiss()
        setStatus('analyzing')

        try {
            // Read the photo from local cache and convert it to base64 for the API.
            const photoFile = new File(photoUri)
            const base64Image = await photoFile.base64()

            const identification = await requestCarIdentification(base64Image, hintText)

            if (identification.carsDetected === 0 || identification.cars.length === 0) {
                setStatus('error')
                return
            }

            setDetectedCars(identification.cars)
            setSelectedCarIndex(0)
            setStatus('result')
        } catch (error) {
            // console.log instead of console.error so a handled failure doesn't open the redbox.
            console.log('Car identification failed:', error)
            setStatus('error')
        }
    }

    function handleReturnToHint() {
        // Return to the hint step with a clean slate so we never show stale results.
        // The hint text is kept so the user can tweak it and re-identify.
        setDetectedCars([])
        setSelectedCarIndex(0)
        setStatus('hint')
    }

    function handleBackToHome() {
        // Jump straight back to the Home tab, dismissing the camera step in between.
        router.dismissTo('/')
    }

    function handleAddToGaragePress() {
        // TODO: save the selected car to Firestore.
    }

    // The result step is a full, distinct layout (photo hero + grouped card), so it renders on its own.
    if (status === 'result' && detectedCars[selectedCarIndex]) {
        return (
            <IdentifiedCarView
                photoUri={photoUri}
                cars={detectedCars}
                selectedIndex={selectedCarIndex}
                capturedAt={capturedAtIso}
                onSelectCar={setSelectedCarIndex}
                onEditHint={handleBackToHome}
                onRetake={() => router.back()}
                onAddToGarage={handleAddToGaragePress}
            />
        )
    }

    // The hint, analyzing and error steps all overlay the captured photo.
    return (
        <View className="flex-1 bg-neutral-950">
            {/* Captured photo as the full-screen background */}
            <Image source={{ uri: photoUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />

            {/* Full-screen dim layers, outside the safe area so they cover the whole photo */}
            {status === 'hint' && <View className="absolute inset-0 bg-black/40" />}
            {status === 'analyzing' && (
                <View className="absolute inset-0 bg-black/70 items-center justify-center gap-4">
                    <ActivityIndicator size="large" color="#bae6fd" />
                    <Text className="text-white text-base font-semibold">Identifying your car...</Text>
                </View>
            )}
            {status === 'error' && <View className="absolute inset-0 bg-black/60" />}

            <SafeAreaView className="flex-1">
                {/* ---- Step 1: optional hint ---- */}
                {status === 'hint' && (
                    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        {/* Back arrow returns to the Home tab, skipping the camera step */}
                        <View className="flex-row items-center h-14 px-2">
                            <TouchableOpacity activeOpacity={0.7} onPress={handleBackToHome} className="w-10 h-10 items-center justify-center">
                                <Ionicons name="chevron-back" size={26} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

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
                            <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center w-full" onPress={handleReturnToHint}>
                                <Text className="text-sky-900 text-base font-semibold">Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    )
}

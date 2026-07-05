import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, db } from '../../services/firebase'

export default function SignupScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleSubmit() {
        try {
            // creates user and returns UID
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid
            // default username to simply their email prefix
            const username = email.split('@')[0]
            const date = new Date()

            await setDoc(doc(db, 'users', uid), {
                username: username,
                email: email,
                streak: 0,
                preferences: {},
                creationDate: date.toLocaleDateString(),
            })
        } catch (err) {
            console.error(err)
            if (err instanceof FirebaseError) {
                Alert.alert('Error', err.message)
            }
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="flex-1 justify-center px-6">
                    {/* Brand + heading */}
                    <View className="items-center mb-8">
                        <Text className="text-sky-300 text-2xl font-bold tracking-widest mb-6">RevDex</Text>
                        <Text className="text-white text-3xl font-bold tracking-tight mb-2">Join the Hunt</Text>
                        <Text className="text-neutral-400 text-sm text-center leading-5 max-w-xs">Every car you spot is yours to keep. Your digital garage awaits.</Text>
                    </View>

                    {/* Email field */}
                    <Text className="text-neutral-400 text-xs uppercase tracking-wider ml-1 mb-1.5">Email Address</Text>
                    <View className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-4 mb-4">
                        <Ionicons name="mail-outline" size={18} color="#737373" />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="john@example.com"
                            placeholderTextColor="#525252"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            className="flex-1 text-white text-base py-3.5 ml-3"
                        />
                    </View>

                    {/* Password field */}
                    <Text className="text-neutral-400 text-xs uppercase tracking-wider ml-1 mb-1.5">Password</Text>
                    <View className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-4 mb-4">
                        <Ionicons name="lock-closed-outline" size={18} color="#737373" />
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="abc123"
                            placeholderTextColor="#525252"
                            keyboardType="default"
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoComplete="current-password"
                            autoCorrect={false}
                            className="flex-1 text-white text-base py-3.5 ml-3"
                        />
                    </View>

                    {/* Primary action */}
                    <TouchableOpacity activeOpacity={0.85} className="bg-sky-200 rounded-2xl py-4 items-center mb-3" onPress={() => handleSubmit()}>
                        <Text className="text-sky-900 text-base font-semibold">Continue</Text>
                    </TouchableOpacity>

                    {/* Google */}
                    <TouchableOpacity activeOpacity={0.7} className="flex-row items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl py-4">
                        <Ionicons name="logo-google" size={18} color="#ffffff" />
                        <Text className="text-white text-base font-semibold">Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Switch to login */}
                    <View className="flex-row items-center justify-center mt-8">
                        <Text className="text-neutral-500 text-sm">Already have an account? </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text className="text-sky-300 text-sm font-semibold">Log In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

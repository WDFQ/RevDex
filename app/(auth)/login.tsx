import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen() {
    const [email, setEmail] = useState('')

    const goToSignup = () => {
        // Sign-up is the root of the auth stack, so step back to it when possible.
        if (router.canGoBack()) router.back()
        else router.replace('/signup')
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="flex-1 justify-center px-6">
                    {/* Brand + heading */}
                    <View className="items-center mb-8">
                        <Text className="text-sky-300 text-2xl font-bold tracking-widest mb-6">RevDex</Text>
                        <Text className="text-white text-3xl font-bold tracking-tight mb-2">Welcome Back</Text>
                        <Text className="text-neutral-400 text-sm text-center leading-5 max-w-xs">
                            Log in to pick up the hunt and keep building your digital garage.
                        </Text>
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

                    {/* Primary action */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        className="bg-sky-200 rounded-2xl py-4 items-center mb-3"
                    >
                        <Text className="text-sky-900 text-base font-semibold">Continue</Text>
                    </TouchableOpacity>

                    {/* Google */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="flex-row items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl py-4"
                    >
                        <Ionicons name="logo-google" size={18} color="#ffffff" />
                        <Text className="text-white text-base font-semibold">Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Switch to signup */}
                    <View className="flex-row items-center justify-center mt-8">
                        <Text className="text-neutral-500 text-sm">Don't have an account? </Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={goToSignup}>
                            <Text className="text-sky-300 text-sm font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

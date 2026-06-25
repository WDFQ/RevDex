import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Alert, View } from 'react-native'

export function LensScreen() {
    // get permissions from user
    const [permission, requestPermission] = ImagePicker.useCameraPermissions()

    const openCamera = async () => {
        // ask for permission if not granted already
        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
            const cameraPermissionRequest = await requestPermission()

            // if user denies perms
            if (!cameraPermissionRequest.granted) {
                Alert.alert('Permission denied', 'Camera permissions are required to take a photo.')
                return
            }

            // open camera if granted permissions
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })

            // handle user interrupt
            if (result.canceled) {
                router.back()
            } else {
                // go to next screen if photo is taken
                router.push({ pathname: '/CaptureCardScreen', params: { imageUri: result.assets[0].uri } })
            }
        }
    }

    useEffect(() => {
        openCamera()
    }, [])

    return <View className="flex-1 bg-black" />
}

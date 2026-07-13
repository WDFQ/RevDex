import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Alert, View } from 'react-native'
import { parseExifCapturedAt } from '../utils/exif'

export default function LensScreen() {
    // get permissions from user
    const [permission, requestPermission] = ImagePicker.useCameraPermissions()

    async function openCamera() {
        // ask for permission if not granted already
        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
            const cameraPermissionRequest = await requestPermission()

            // if user denies perms
            if (!cameraPermissionRequest.granted) {
                Alert.alert('Permission denied', 'Camera permissions are required to take a photo.')
                return
            }
        }

        // open camera if granted permissions
        // exif: true so the capture card can read the photo's own capture date, same as an upload.
        const result = await ImagePicker.launchCameraAsync({
            quality: 1,
            exif: true,
        })

        // handle user interrupt
        if (result.canceled) {
            router.back()
            return
        }

        // get uri and timestamp and pass into capture card
        const asset = result.assets[0]
        const capturedAt = parseExifCapturedAt(asset.exif)
        router.replace({ pathname: '/CaptureCardScreen', params: { imageUri: asset.uri, capturedAt } })
    }

    useEffect(() => {
        openCamera()
    }, [])

    return <View className="flex-1 bg-black" />
}

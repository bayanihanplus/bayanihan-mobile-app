import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";

/**
 * Opens the app settings so the user can manually enable permissions.
 */
async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.warn("Failed to open app settings:", error);
  }
}

/**
 * Requests camera + microphone (optional) permission.
 * @param withAudio - set true if you want microphone access (for video recording)
 */
export async function requestCameraPermission(withAudio: boolean = false): Promise<boolean> {
  if (Platform.OS !== "android") return true; // iOS handles this automatically

  try {
    const permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];

    if (withAudio) {
      permissions.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);

    const cameraResult = granted[PermissionsAndroid.PERMISSIONS.CAMERA];
    const micResult = withAudio
      ? granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]
      : PermissionsAndroid.RESULTS.GRANTED;

    const cameraGranted = cameraResult === PermissionsAndroid.RESULTS.GRANTED;
    const micGranted = micResult === PermissionsAndroid.RESULTS.GRANTED;

    if (!cameraGranted) {
      if (cameraResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          "Camera Permission Required",
          "You have permanently denied camera permission. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openAppSettings },
          ]
        );
      } else {
        Alert.alert("Camera Permission Denied", "Camera is required to continue.");
      }
      return false;
    }

    if (withAudio && !micGranted) {
      if (micResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          "Microphone Permission Required",
          "You have permanently denied microphone permission. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openAppSettings },
          ]
        );
      } else {
        Alert.alert("Microphone Permission Denied", "Videos will not have sound.");
      }
    }

    return true;
  } catch (err) {
    console.warn("Camera permission error:", err);
    return false;
  }
}

/**
 * Requests storage permission (needed for gallery access on Android < 13).
 */
export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to your storage to pick media from gallery.",
        buttonPositive: "OK",
      }
    );

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        "Storage Permission Required",
        "You have permanently denied storage permission. Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      return false;
    }

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn("Storage permission error:", err);
    return false;
  }
}

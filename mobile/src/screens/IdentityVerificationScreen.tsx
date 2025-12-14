import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Tesseract from "tesseract.js";
import { useAuthContext } from "../context/AuthContext";
import { Platform } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveStep } from "../utils/stepStorage";

type RootStackParamList = {
  IdentityVerification: undefined;
  Verification: {
    selfie: string;
    idImage: string;
    confidence: number;
    distance: number;
  };
};

export default function IdentityVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token, user } = useAuthContext();
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("IdentityVerification");
  const [parsedFields, setParsedFields] = useState<{
    idType?: string;
    name?: string;
    idNumber?: string;
    dob?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [lowConfidence, setLowConfidence] = useState<boolean>(false);

   // 🔄 Save progress automatically whenever currentStep changes
  useEffect(() => {
    const saveProgress = async () => {
      await saveStep(currentStep);
      console.log(`[STEP] Progress saved: Step ${currentStep}`);
    };
    saveProgress();
  }, [currentStep]);
  // ---------- Pick Image ----------//
  const pickImage = async (type: "id" | "selfie") => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (type === "id") {
          setIdImage(uri);
          setLowConfidence(false);
          console.log("[CAMERA] ID image captured:", uri);
          extractTextFromID(uri);
        } else {
          setSelfieImage(uri);
          console.log("[CAMERA] Selfie captured:", uri);
        }
      }
    } catch (err) {
      console.log("[CAMERA ERROR]", err);
      Alert.alert("Error", "Failed to capture image.");
    }
  };

  //------------ Save to Database -----------------//
  const saveVerificationResult = async (userId: string, result: any) => {
  try {
    const response = await fetch("https://bayanihanplus.com/api/verification/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        verified: result.verified,
        confidence: result.confidence,
        distance: result.distance,
      }),
    });

    const data = await response.json();
    console.log("[SAVE RESULT RESPONSE]", data);

    if (data.success) {
      Alert.alert("✅ Verification Saved", "Your identity has been verified successfully.");
    } else {
      Alert.alert("⚠️ Verification Failed", "Unable to save verification status.");
    }
  } catch (error) {
    console.error("[SAVE VERIFICATION ERROR]", error);
  }
};
  // ---------- Preprocess for OCR ----------
  const preprocessImage = async (uri: string): Promise<string> => {
    try {
      const image = await fetch(uri);
      const blob = await image.blob();
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to black & white
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const threshold = avg > 140 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = threshold;
      }
      ctx.putImageData(imageData, 0, 0);

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("[OCR] Preprocess failed:", err);
      return uri;
    }
  };

  // ---------- OCR ----------
  const extractTextFromID = async (imageUri: string) => {
    try {
      setLoading(true);
      setOcrText("");
      setParsedFields({});

      const cleanUri = await preprocessImage(imageUri);
      console.log("[OCR] 🧠 Starting recognition for:", cleanUri);

      const result = await Tesseract.recognize(cleanUri, "eng");

      console.log("[OCR] ✅ Recognition complete.");

      const page: any = result?.data ?? {};
      const text: string = page?.text ?? "";
      console.log("[OCR] Raw Text Output:\n", text);

      const words: any[] =
        Array.isArray(page?.words) ? page.words :
        Array.isArray(page?.symbols) ? page.symbols : [];

      const wordCount = words.length;
      console.log(`[OCR] Words detected: ${wordCount}`);

      let avgConfidence = 0;
      if (wordCount > 0) {
        const total = words.reduce((sum: number, w: any) => {
          const conf =
            typeof w?.confidence === "number"
              ? w.confidence
              : typeof w?.conf === "number"
              ? w.conf
              : 0;
          return sum + conf;
        }, 0);
        avgConfidence = total / wordCount;
      }
      console.log("[OCR] Average confidence:", avgConfidence);

      setOcrText(text);
      const parsed = parsePHIDFields(text);
      console.log("[OCR] Parsed Fields:", parsed);
      setParsedFields(parsed);

      if (avgConfidence > 0 && avgConfidence < 60) {
        setLowConfidence(true);
        Alert.alert("Blurry Image", "The capture looks unclear — please retake.");
      } else {
        setLowConfidence(false);
      }
    } catch (err) {
      console.error("[OCR ❌ ERROR]", err);
      Alert.alert("OCR Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- PH ID Parsing ----------
  const parsePHIDFields = (text: string) => {
    const lines = text
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed: {
      idType?: string;
      name?: string;
      idNumber?: string;
      dob?: string;
    } = {};

    // Match common PH ID formats
    const dlMatch = text.match(/[A-Z]{1,2}\d{2}-\d{2}-\d{6}/);
    if (dlMatch) {
      parsed.idType = "Driver’s License";
      parsed.idNumber = dlMatch[0];
    }

    const umidMatch = text.match(/CRN[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d/);
    if (umidMatch) {
      parsed.idType = "UMID";
      parsed.idNumber = umidMatch[0];
    }

    const philhealthMatch = text.match(/\b\d{2}-\d{9}-\d\b/);
    if (philhealthMatch) {
      parsed.idType = "PhilHealth";
      parsed.idNumber = philhealthMatch[0];
    }

    const sssMatch = text.match(/\b\d{2}-\d{7}-\d\b/);
    if (sssMatch) {
      parsed.idType = "SSS";
      parsed.idNumber = sssMatch[0];
    }

    const passportMatch = text.match(/\b[A-Z]\d{7}\b/);
    if (passportMatch) {
      parsed.idType = "Passport";
      parsed.idNumber = passportMatch[0];
    }

    const dobMatch = text.match(
      /(19|20)\d{2}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.](19|20)\d{2}/
    );
    if (dobMatch) parsed.dob = dobMatch[0];

    const nameCandidate = lines.find(
      (line) =>
        /^[A-Za-z,\s-]+$/.test(line) &&
        line.includes(",") &&
        line.split(" ").length <= 5 &&
        !/\b(DATE|BIRTH|LICENSE|ADDRESS|NUMBER|ID|SEX|HEIGHT|WEIGHT|NATIONALITY)\b/i.test(line)
    );
    if (nameCandidate) parsed.name = nameCandidate;

    if (!parsed.idType && parsed.idNumber) parsed.idType = "Unknown ID";
    return parsed;
  };

  // ---------- Continue ----------
 /*  const handleContinue = () => {
    if (!idImage || !selfieImage) {
      Alert.alert("Incomplete", "Please upload both ID and selfie before continuing.");
      return;
    }
    navigation.navigate("Orientation");
  }; */
  // Inside your IdentityVerificationScreen component


const handleConfirmSelfie = async () => {
 
  try {
    console.log(
      "[SELFIE] Confirm pressed:",
      selfieImage,
      "id:",
      idImage,
      "userId:",
      user.id
    );

    if (!selfieImage || !idImage) {
      Alert.alert("Error", "Both ID and selfie are required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    if (Platform.OS === "web") {
      // Web: convert image URLs to Blob
      const fetchBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
      };

      const selfieBlob = await fetchBlob(selfieImage);
      const idBlob = await fetchBlob(idImage);

      formData.append("selfie", selfieBlob, "selfie.jpg");
      formData.append("idImage", idBlob, "id.jpg");
    } else {
      // Mobile: use uri directly
      formData.append("selfie", {
        uri: selfieImage,
        type: "image/jpeg",
        name: "selfie.jpg",
      } as any);

      formData.append("idImage", {
        uri: idImage,
        type: "image/jpeg",
        name: "id.jpg",
      } as any);
    }

    formData.append("userId", String(user.id));

    const response = await fetch(
      "https://bayanihanplus.com/api/verification/verify",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    console.log("[VERIFY RESULT]", result);

    if (result.verified) {
        navigation.navigate("Verification", {
        selfie: selfieImage,
        idImage,
        confidence: result.confidence,
        distance: result.distance,
      });
    } else {
      Alert.alert("Verification Failed", "Face not matched or unclear image.");
    }
  } catch (error: any) {
    console.error("[VERIFY ERROR]", error);
    Alert.alert("Upload Error", error.message);
  } finally {
    setLoading(false);
  }
};


  // ---------- UI ----------
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.desc}>For security, please scan your valid Philippine ID and take a live selfie.</Text>

       <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Scan Your ID</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage("id")}>
            {idImage ? (
              <Image source={{ uri: idImage }} style={styles.preview} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="id-card-outline" size={32} color="#9ca3af" />
                <Text style={styles.uploadText}>Tap to capture ID</Text>
              </View>
            )}
          </TouchableOpacity>
          {loading && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={{ color: "#9ca3af", fontSize: 13 }}>Reading ID text...</Text>
            </View>
          )}
          {ocrText && (
            <View style={styles.ocrBox}>
              <Text style={styles.ocrTitle}>Detected ID Details:</Text>
              <Text style={styles.ocrText}>Type: {parsedFields.idType || "-"}</Text>
              <Text style={styles.ocrText}>Name: {parsedFields.name || "-"}</Text>
              <Text style={styles.ocrText}>ID Number: {parsedFields.idNumber || "-"}</Text>
              <Text style={styles.ocrText}>DOB: {parsedFields.dob || "-"}</Text>
              <TouchableOpacity
                style={[styles.retakeButton, { marginTop: 12 }]}
                onPress={() => pickImage("id")}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
       <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 2: Take a Selfie</Text>

          {selfieImage ? (
            <View>
              <View style={styles.selfiePreviewWrapper}>
                <Image source={{ uri: selfieImage }} style={styles.preview} />
              </View>
              <View style={styles.selfieButtonsRow}>
                <TouchableOpacity
                  style={[styles.buttonSmall, { backgroundColor: "#6b7280" }]}
                  onPress={() => setSelfieImage(null)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="refresh" size={18} color="#fff" />
                    <Text style={styles.buttonSmallText}>Retake</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonSmall, { backgroundColor: "#2563eb" }]}
                  onPress={handleConfirmSelfie}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.buttonSmallText}>Confirm</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage("selfie")}>
              <View style={{ alignItems: "center" }}>
                <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                <Text style={styles.uploadText}>Tap to take selfie</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
  },
  headerTitle: { color: "#f9fafb", fontSize: 18, fontWeight: "600", marginLeft: 10 },
  content: { padding: 20 },
  desc: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#1f2937", borderRadius: 14, padding: 16, marginBottom: 20 },
  cardTitle: { color: "#f3f4f6", fontWeight: "600", fontSize: 15, marginBottom: 12 },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  uploadText: { color: "#9ca3af", fontSize: 13, marginTop: 6 },
  preview: { width: "100%", height: "100%", borderRadius: 12 },
  ocrBox: { marginTop: 14, backgroundColor: "#0f172a", borderRadius: 8, padding: 10 },
  ocrTitle: { color: "#93c5fd", fontWeight: "600", marginBottom: 6 },
  ocrText: { color: "#d1d5db", fontSize: 13 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginRight: 6 },
  retakeButton: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
  },
  retakeText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  selfiePreviewWrapper: {
  borderRadius: 12,
  overflow: "hidden",
  width: "100%",
  height: 200, // 🧠 make sure it has space to render
  backgroundColor: "#111827", // fallback background
  justifyContent: "center",
  alignItems: "center",
  },
  selfieButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  buttonSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonSmallText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
});

import React, {useState,useEffect} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { saveStep } from "../utils/stepStorage";

export default function VerificationSuccessScreen({ route, navigation }: any) {
  const { selfie, idImage, confidence, distance } = route.params;
  const [currentStep, setCurrentStep] = useState<string>("Verification");
  // 🔄 Save progress automatically whenever currentStep changes
    useEffect(() => {
      const saveProgress = async () => {
        await saveStep(currentStep);
        console.log(`[STEP] Progress saved: Step ${currentStep}`);
      };
      saveProgress();
    }, [currentStep]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
        <Text style={styles.title}>Verification Successful!</Text>
      </View>

      <View style={styles.previewRow}>
        {idImage && <Image source={{ uri: idImage }} style={styles.image} />}
        {selfie && <Image source={{ uri: selfie }} style={styles.image} />}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>✅ Verified: <Text style={styles.value}>True</Text></Text>
        <Text style={styles.infoText}>💯 Confidence: <Text style={styles.value}>{confidence || "N/A"}%</Text></Text>
        <Text style={styles.infoText}>📏 Distance: <Text style={styles.value}>{distance || "N/A"}</Text></Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Orientation")}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  title: { color: "#f9fafb", fontSize: 20, fontWeight: "700", marginTop: 10 },
  previewRow: { flexDirection: "row", marginBottom: 20 },
  image: { width: 140, height: 140, borderRadius: 10, marginHorizontal: 8, borderWidth: 2, borderColor: "#22c55e" },
  infoBox: { backgroundColor: "#1f2937", padding: 15, borderRadius: 12, marginBottom: 30, width: "100%" },
  infoText: { color: "#9ca3af", fontSize: 15, marginBottom: 6 },
  value: { color: "#93c5fd", fontWeight: "600" },
  button: { flexDirection: "row", backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginRight: 6 },
});

import React,{useState,useEffect,useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_BASE_URL } from "../api/api";

type RootStackParamList = {

  OnboardingHub : undefined;
  IdentityVerification : undefined;
  Verification : undefined;
  Orientation : undefined;
  Application : undefined;
  FinalReview : undefined;
  ApplicationReviewPending : undefined;
  Approval : undefined;
  CoopPreDashboard : undefined;
  CoopDashboard : undefined;
  Social : undefined;

};

 export default function OnboardingHubScreen() {
  const [currentStep, setCurrentStep] = useState<string>("OnboardingHub");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isRestoringRef = useRef(true);

  // 🔄 Save progress automatically whenever currentStep changes
          useEffect(() => {
          const restoreStep = async () => {
            try {

              const savedStep = await AsyncStorage.getItem("@verification_step");
              const stepName = savedStep || "OnboardingHub";

              console.log(`[STEP RESTORE] Restoring to Step ${stepName}`);
              setCurrentStep(stepName);
              isRestoringRef.current = false; // ✅ done restoring

              if (stepName !== "OnboardingHub") {
                navigation.reset({
                  index: 0,
                  routes: [{ name: stepName as never }],
                });

                Toast.show({
                  type: "success",
                  text1: "Welcome back! 👋",
                  text2: `Resuming from ${stepName}`,
                });
              }
            } catch (error) {
              console.warn("[STEP RESTORE] Failed:", error);
              isRestoringRef.current = false;
            }
          };

          restoreStep();
        }, []);

        // 🔄 Save progress only AFTER restore
        useEffect(() => {
          if (isRestoringRef.current) return; // 👈 Skip saving while restoring
          const saveProgress = async () => {
            await AsyncStorage.setItem("@verification_step", currentStep);
            console.log(`[STEP] Progress saved: ${currentStep}`);
          };
          saveProgress();
        }, [currentStep]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Logo & Intro */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/bayanihanLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join The Cooperative</Text>
          <Text style={styles.subtitle}>
            Your all-in-one platform for community, business, and growth.
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Membership Journey</Text>

          <View style={styles.steps}>
            <Step label="1. Join Now" icon="person-add-outline" active />
            <Step label="2. Identity Verification" icon="id-card-outline" />
            <Step label="3. Orientation" icon="school-outline" />
            <Step label="4. Application Form" icon="document-text-outline" />
            <Step label="5. Payments" icon="card-outline" />
            <Step label="6. Review" icon="checkmark-done-outline" />
            <Step label="7. Approval" icon="ribbon-outline" />
            <Step label="8. Post-Join Access" icon="wallet-outline" />
          </View>
        </View>

        {/* Call-to-Action */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("IdentityVerification")}
        >
          <Text style={styles.buttonText}>Join Now</Text>
          <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Step Component */
const Step = ({ label, icon, active }: any) => (
  <View style={[styles.step, active && styles.activeStep]}>
    <Ionicons
      name={icon}
      size={20}
      color={active ? "#2563eb" : "#9ca3af"}
      style={{ marginRight: 8 }}
    />
    <Text style={[styles.stepText, active && styles.activeStepText]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  scroll: { padding: 20, paddingBottom: 60 },
  header: { alignItems: "center", marginBottom: 20 },
  logo: { width: 160, height: 80, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f9fafb",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
    marginHorizontal: 10,
  },
  progressCard: {
    backgroundColor: "#1f2937",
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
  },
  progressTitle: {
    color: "#f3f4f6",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  steps: { gap: 10 },
  step: { flexDirection: "row", alignItems: "center", opacity: 0.7 },
  activeStep: { opacity: 1 },
  stepText: { color: "#9ca3af", fontSize: 14 },
  activeStepText: { color: "#2563eb", fontWeight: "600" },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 6,
  },
  footerText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },
  linkText: { color: "#2563eb", fontWeight: "600" },
});

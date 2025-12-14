import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveStep } from "../utils/stepStorage";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
export default function ApplicationReviewPendingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<string>("ApplicationReviewPending");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔄 Save progress automatically whenever currentStep changes
  useEffect(() => {
    const saveProgress = async () => {
      await saveStep(currentStep);
      console.log(`[STEP] Progress saved: Step ${currentStep}`);
    };
    saveProgress();
  }, [currentStep]);

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto-navigate to approval screen after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate("Approval");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={48} color="#2563eb" />
        </View>

        <Text style={styles.title}>Your Application is Under Review</Text>
        <Text style={styles.subtitle}>
          Please hold tight while our team verifies your identity and submitted documents.
        </Text>

        <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 25 }} />

        <Text style={styles.infoText}>
          This process may take a few moments depending on verification queue.  
          You’ll be redirected once your membership is approved.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 25,
  },
  iconContainer: {
    backgroundColor: "#e0e7ff",
    borderRadius: 50,
    padding: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
  },
});

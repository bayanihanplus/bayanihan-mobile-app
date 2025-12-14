import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { saveStep } from "../utils/stepStorage";

export default function ApprovalScreen({ navigation }: any) {
  const [ currentStep , setCurrentStep ] = useState<string>("Approval");
  const scaleAnim = useRef(new Animated.Value(0)).current;

   // 🔄 Save progress automatically whenever currentStep changes
    useEffect(() => {
      const saveProgress = async () => {
        await saveStep(currentStep);
        console.log(`[STEP] Progress saved: Step ${currentStep}`);
      };
      saveProgress();
    }, [currentStep]);

  useEffect(() => {
    // ✅ Animate the success icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // ⏳ Redirect after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace("CoopPreDashboard"); // 👈 redirect to Coop dashboard
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* 🎉 Confetti */}
      <ConfettiCannon count={60} origin={{ x: 200, y: 0 }} fadeOut={true} />

      {/* ✅ Animated Check Icon */}
      <Animated.View
        style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}
      >
        <Ionicons name="checkmark" size={50} color="#fff" />
      </Animated.View>

      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.subtitle}>
        Your membership has been approved 🎉
      </Text>

      {/* 💳 Digital Membership Card */}
      <View style={styles.card}>
        <Image
           source={require("../../assets/bayanihanLogo.png")}
          style={styles.cardLogo}
          resizeMode="cover"
        />
        <Text style={styles.cardTitle}>Bayanihan Cooperative</Text>
        <Text style={styles.cardLabel}>Member ID</Text>
        <Text style={styles.cardValue}>
          BNH-{Math.floor(100000 + Math.random() * 900000)}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.cardName}>Juan Dela Cruz</Text>
        <Text style={styles.cardDate}>Joined: November 2025</Text>
      </View>

      <Text style={styles.footer}>
        You can now access your wallet, benefits, and upcoming Coop events.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconCircle: {
    backgroundColor: "#22c55e",
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 10,
    marginHorizontal: 30,
  },
  card: {
    backgroundColor: "#1e3a8a",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    alignItems: "center",
    elevation: 6,
  },
  cardLogo: {
    width: 80,
    height: 60,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardLabel: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  cardValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#3b82f6",
    marginVertical: 10,
  },
  cardName: {
    color: "#fef9c3",
    fontSize: 17,
    fontWeight: "600",
  },
  cardDate: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  footer: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 25,
    lineHeight: 22,
    marginHorizontal: 30,
  },
});

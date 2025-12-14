import React, { useState,useMemo,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground
} from "react-native";
import api from "../api/api";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getRandomBackground } from "../utils/backgrounds";
import MiniSplash from "../components/MiniSplash";

type ForgotNav = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotNav>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const randomBg = useMemo(() => getRandomBackground(), []);
  const [showSplash, setShowSplash] = useState(true); 

  
  // Mini splash effect on screen load
    useEffect(() => {
      const timer = setTimeout(() => setShowSplash(false), 800); // 0.8s splash
      return () => clearTimeout(timer);
    }, []);


  const handleReset = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Please enter your email" });
      return;
    }
    setLoading(true);
    try {
      // 🔥 Call your backend reset route
      await api.post("/auth/forgot-password", { email });

      Toast.show({
        type: "success",
        text1: "Password reset link sent",
        text2: "Please check your email inbox.",
      });
      navigation.navigate("ResetPassword", { email });
    } catch (error: any) {
      console.error("❌ Forgot password error:", error);
      Toast.show({
        type: "error",
        text1: "Error sending reset link",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={randomBg} style={styles.background} resizeMode="cover">
      {showSplash ? (
        <MiniSplash />
      ):(
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address. We’ll send you a password reset link.
          </Text>

          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {loading ? (
            <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
       )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(255,255,255,0.1)" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 10, color: "#111827" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#6b7280", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#d10000",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backText: { color: "#2563eb", textAlign: "center", marginTop: 20, fontWeight: "500" },
});

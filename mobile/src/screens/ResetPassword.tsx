import React, { useState, useRef, useEffect,useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import api from "../api/api"; // your axios instance
import { getRandomBackground } from "../utils/backgrounds";
import MiniSplash from "../components/MiniSplash";

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email = route.params?.email || "";
  const randomBg = useMemo(() => getRandomBackground(), []);
  const [showSplash, setShowSplash] = useState(true); 

  // OTP
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputsRef = useRef<Array<TextInput | null>>([]);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength
  const [strength, setStrength] = useState(0);

   // ✅ Mini splash effect on screen load
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 800); // 0.8s splash
    return () => clearTimeout(timer);
  }, []);

  // Update password strength
  useEffect(() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    setStrength(score);
  }, [newPassword]);

  const handleReset = async () => {
    if (!email) return Alert.alert("Error", "Email is missing");
    const code = otp.join("");
    if (code.length < 6 || !newPassword || !confirmPassword)
      return Alert.alert("Error", "All fields are required");
    if (newPassword !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");
    if (strength < 3)
      return Alert.alert(
        "Weak Password",
        "Password must be at least 8 chars, include uppercase and number."
      );

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      Toast.show({
        type: "success",
        text1: res.data.message || "Password reset successful!",
      });

      navigation.navigate("Login");
    } catch (err: any) {
      console.error("Reset password error:", err.response?.data || err.message);
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Reset failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <ImageBackground source={randomBg} style={styles.background} resizeMode="cover">
      {showSplash ? (
        <MiniSplash />
      ) : (
          <SafeAreaView style={styles.container}>
           
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={styles.inner}
                >
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to your email and your new password.
                  </Text>

                  {/* OTP Inputs */}
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (inputsRef.current[index] = ref)}
                        value={digit}
                        onChangeText={(text) => {
                          if (!/^\d*$/.test(text)) return;
                          const newOtp = [...otp];
                          newOtp[index] = text;
                          setOtp(newOtp);

                          if (text && index < 5) inputsRef.current[index + 1]?.focus();
                          if (!text && index > 0) inputsRef.current[index - 1]?.focus();
                        }}
                        keyboardType="number-pad"
                        maxLength={1}
                        style={styles.otpInput}
                      />
                    ))}
                  </View>

                  {/* Password Inputs */}
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="New Password"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={24}
                        color="#555"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Confirm Password"
                      secureTextEntry={!showConfirm}
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      <MaterialIcons
                        name={showConfirm ? "visibility" : "visibility-off"}
                        size={24}
                        color="#555"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Password strength */}
                  <View style={styles.strengthBarContainer}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strength ? "#4CAF50" : "#ccc" },
                        ]}
                      />
                    ))}
                  </View>

                  {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 10 }} />
                  ) : (
                    <TouchableOpacity style={styles.button} onPress={handleReset}>
                      <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back to Login</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
               </SafeAreaView>
       )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, backgroundColor: "transparent" },
  inner: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#333" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#555", marginBottom: 20 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    width: 40,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  passwordContainer: { position: "relative", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  eyeIcon: { position: "absolute", right: 10, top: 12 },
  strengthBarContainer: { flexDirection: "row", marginBottom: 20, justifyContent: "space-between" },
  strengthBar: { height: 5, flex: 1, marginHorizontal: 2, borderRadius: 2 },
  button: { marginTop: 10, backgroundColor: "#c20606ff", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backText: { color: "#2563eb", textAlign: "center", marginTop: 20, fontWeight: "500" },
});

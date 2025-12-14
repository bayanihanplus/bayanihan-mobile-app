import React, { useState,useMemo, useEffect  } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
  ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import api from "../api/api";
import Toast from "react-native-toast-message";
import { getRandomBackground } from "../utils/backgrounds";
import MiniSplash from "../components/MiniSplash";

type SignupNav = NativeStackNavigationProp<RootStackParamList, "Signup">;

export default function SignupScreen() {
  
  const navigation = useNavigation<SignupNav>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const randomBg = useMemo(() => getRandomBackground(), []);
  const [showSplash, setShowSplash] = useState(true); 

    // ✅ Mini splash effect on screen load
    useEffect(() => {
      const timer = setTimeout(() => setShowSplash(false), 800); // 0.8s splash
      return () => clearTimeout(timer);
    }, []);

  const handleSignup = async () => {
  
     if (!username || !email || !password || !confirmPassword) {
       Toast.show({ type: "error", text1: "Please enter email and password" });
       return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Password not match!" });
      return;
    }

    try {

      setLoading(true);
        const response = await api.post("/auth/register",{
            username,
            email,
            password,
        });
          Toast.show({
                type: "success",
                text1: `Welcome back, ${response.data.user.username} Registered!!`,
              });
        navigation.navigate("Login");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error",error.response?.data?.message || "Something went wrong!");
    }finally{
      setLoading(false);
    }
    
  };

  return (
    <ImageBackground source={randomBg} style={styles.background} resizeMode="cover">
      {showSplash ? (
        <MiniSplash />
      ) : (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
              <Image
                  source={require("../../assets/bayanihanLogo.png")} // replace with your logo path
                  style={styles.logo}
                  resizeMode="contain"
              />

          <Text style={styles.title}>Create Account ✨</Text>
          <Text style={styles.subtitle}>Join us and get started</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-circle-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="ascii-capable"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input with Toggle */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input with Toggle */}
          <View style={styles.inputWrapper}>
            <Ionicons name="checkmark-done-outline" size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 10 }} />
            ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            )}

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkHighlight}>Login</Text>
            </Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
      )}
     </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "transparent" },
  title: { fontSize: 30, fontWeight: "700", color: "#111827", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6b7280", marginBottom: 24, textAlign: "center" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  logo: {
    width: 350,
    height: 150,
    marginBottom: 30,
    alignItems:"center"
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#111827" },
  link: { textAlign: "center", marginTop: 16, color: "#6b7280" },
  linkHighlight: { color: "#2563eb", fontWeight: "600" },
  button: {
  width: "100%",
  padding: 15,
  backgroundColor: "#d10000", // your color here
  borderRadius: 8,
  alignItems: "center",
  marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

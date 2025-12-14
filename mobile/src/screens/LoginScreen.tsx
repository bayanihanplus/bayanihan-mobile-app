import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Toast from "react-native-toast-message";
import api from "../api/api";
import { useAuthContext } from "../context/AuthContext";
import { getRandomBackground } from "../utils/backgrounds";
import MiniSplash from "../components/MiniSplash";

// FB AND GOOGLE LOGIN
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const randomBg = useMemo(() => getRandomBackground(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const [usePinLogin, setUsePinLogin] = useState(false);
  const [pin, setPin] = useState("");
  const [modeSelected, setModeSelected] = useState(false); // tracks if a mode was chosen
  const pinInputRef = useRef<TextInput>(null);
  const [showSplash, setShowSplash] = useState(true); 

  // Animation values
  const inputOpacity = useRef(new Animated.Value(1)).current;
  const inputTranslate = useRef(new Animated.Value(0)).current;


  // ✅ Mini splash effect on screen load
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 800); // 0.8s splash
    return () => clearTimeout(timer);
  }, []);


  // Email/password login
  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Please enter email and password" });
      return;
    }
  
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data;
      await login(token, user);

      Toast.show({ type: "success", text1: `Welcome back, ${user.username}!` });
      navigation.replace("Social");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // PIN login
  const handlePinLoginSubmit = async () => {
    if (!pin) {
      Toast.show({ type: "error", text1: "Please enter your PIN" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/pin-login", { pin });
      const { token, user } = response.data;
      await login(token, user);

      Toast.show({ type: "success", text1: `Welcome back, ${user.username}!` });
      navigation.replace("Home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "PIN login failed",
        text2: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle login mode with animation
  const toggleLoginMode = (usePin: boolean) => {
    setModeSelected(true); // show main buttons
    Animated.parallel([
      Animated.timing(inputOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(inputTranslate, { toValue: 20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setUsePinLogin(usePin);
      inputOpacity.setValue(0);
      inputTranslate.setValue(-20);
      Animated.parallel([
        Animated.timing(inputOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(inputTranslate, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      if (usePin) setTimeout(() => pinInputRef.current?.focus(), 100);
    });
  };


  // === GOOGLE LOGIN SETUP ===
const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
  clientId: "262962600747-sl5cq8oqounk3r7mp1gc0mnbhopt0p6l.apps.googleusercontent.com", // Web client ID
  iosClientId: "262962600747-sl5cq8oqounk3r7mp1gc0mnbhopt0p6l.apps.googleusercontent.com",
  androidClientId: "262962600747-sl5cq8oqounk3r7mp1gc0mnbhopt0p6l.apps.googleusercontent.com",
  // ✅ useProxy is removed
});

// Handle Google response
useEffect(() => {
  if (googleResponse?.type === "success") {
    const { authentication } = googleResponse;
    if (authentication?.accessToken) {
      handleSocialLogin("google", authentication.accessToken);
    }
  }
}, [googleResponse]);

// === FACEBOOK LOGIN SETUP ===
const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
  clientId: "<YOUR_FACEBOOK_APP_ID>",
});

useEffect(() => {
  if (fbResponse?.type === "success") {
    const { authentication } = fbResponse;
    if (authentication?.accessToken) handleSocialLogin("facebook", authentication.accessToken);
  }
}, [fbResponse]);

// === SOCIAL LOGIN HANDLER ===
const handleSocialLogin = async (provider: "google" | "facebook", accessToken: string) => {
  try {
    setLoading(true);
    const response = await api.post("/auth/social-login", { provider, token: accessToken });
    const { token, user } = response.data;
    await login(token, user);
    Toast.show({ type: "success", text1: `Welcome, ${user.username}!` });
    navigation.replace("Social");
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Social Login Failed",
      text2: error.response?.data?.message || "Please try again",
    });
  } finally {
    setLoading(false);
  }
};

  
  return (
    <ImageBackground source={randomBg} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      {showSplash ? (
        <MiniSplash />
      ):(
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Image
            source={require("../../assets/bayanihanLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          {/* Animated Inputs */}
          <Animated.View
            style={{
              opacity: inputOpacity,
              transform: [{ translateY: inputTranslate }],
              width: "100%",
            }}
          >
            {usePinLogin ? (
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color="#6b7280" style={styles.icon} />
                <TextInput
                  ref={pinInputRef}
                  placeholder="Enter PIN"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="numeric"
                  secureTextEntry
                  value={pin}
                  onChangeText={setPin}
                  onSubmitEditing={handlePinLoginSubmit}
                />
              </View>
            ) : (
              <>
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

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.icon} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#999"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>

          {/* Step 1: Mode selection buttons */}
          {!modeSelected && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 5 }]}
                onPress={() => toggleLoginMode(false)}
              >
                <Text style={styles.buttonText}>Login with Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { flex: 1, marginLeft: 5, backgroundColor: "#6C63FF" }]}
                onPress={() => toggleLoginMode(true)}
              >
                <Text style={styles.buttonText}>Login with PIN</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Main buttons after mode selected */}
          {modeSelected && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              {/* Login */}
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 5 }]}
                onPress={() => {
                  if (usePinLogin) handlePinLoginSubmit();
                  else handleLogin();
                }}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              {/* Switch */}
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginLeft: 5, backgroundColor: "#6C63FF" }]}
                onPress={() => setModeSelected(false)}
              >
                <Text style={styles.buttonText}>{usePinLogin ? "Use Email" : "Use PIN"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />}

          {/* Auth Links */}
          <View style={styles.authLinksContainer}>
            <Text style={{ color: "#fff" }}>
              <Text
                style={styles.linkHighlight}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                Forgot password?
              </Text>
              <Text style={styles.separator}> | </Text>
              <Text
                style={styles.linkHighlight}
                onPress={() => navigation.navigate("Signup")}
              >
                Sign up
              </Text>
            </Text>
          </View>
      {/* GOOGLE BUTTON */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4285F4", marginTop: 10 }]}
        onPress={() => googlePromptAsync()}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* FACEBOOK BUTTON */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#1877F2", marginTop: 10 }]}
        onPress={() => fbPromptAsync()}
      >
        <Text style={styles.buttonText}>Continue with Facebook</Text>
      </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { width: 300, height: 120, alignSelf: "center", marginTop: 30 },
  title: { fontSize: 30, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#e5e7eb", textAlign: "center", marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    width: "100%", // 👈 important
    maxWidth: 400, // 👈 prevent too wide on tablets
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#111827" },
  button: { width: "100%", padding: 15, backgroundColor: "#d10000", borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  authLinksContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 },
  separator: { color: "#fff", marginHorizontal: 6, fontWeight: "500" },
  linkHighlight: { color: "#fff", fontWeight: "600" },
});

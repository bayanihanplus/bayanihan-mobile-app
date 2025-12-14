import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import api from "../api/api";
import Toast from "react-native-toast-message";

type AuthNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function AuthLoadingScreen() {
  const navigation = useNavigation<AuthNav>();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      try {
        // Optional: validate token with backend
        await api.get("/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        navigation.replace("Home");
      } catch (err) {
        await AsyncStorage.removeItem("token");
        Toast.show({ type: "error", text1: "Session expired, please login again" });
        navigation.replace("Login");
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

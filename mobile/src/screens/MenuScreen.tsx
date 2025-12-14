import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native"; // ✅ import hook
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
  EditProfile: undefined;
  Menu: undefined;
};

export default function MenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // ✅ get navigation

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      Toast.show({
        type: "error",
        text1: "Logged out Successfully!",
      });

      navigation.replace("Login"); // ✅ now navigation is defined
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while logging out.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <Ionicons
          name="person-circle-outline"
          size={22}
          color="#374151"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.menuText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#ef4444"
          style={{ marginRight: 10 }}
        />
        <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
});

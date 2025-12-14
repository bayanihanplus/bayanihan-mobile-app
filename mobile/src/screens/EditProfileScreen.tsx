import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import api, { API_BASE_URL } from "../api/api";
import Button from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
//import CountryPicker from "react-native-country-picker-modal";

export default function EditProfileScreen() {
  const navigation = useNavigation(); // ✅ For navigation actions
  const [profile, setProfile] = useState({
    username: "",
    address: "",
    contact: "",
    age: 18,
    status: "",
    countryCode: "PH", // ✅ Use ISO country code
  });

  const [image, setImage] = useState<string | null>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch profile once
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          username: res.data.username || "",
          address: res.data.address || "",
          contact: res.data.contact || "",
          age: res.data.age || 18,
          status: res.data.status || "",
          countryCode: res.data.countryCode || "PH",
        });

        if (res.data.profile_picture) {
          setImage(
            res.data.profile_picture.startsWith("data:image")
              ? res.data.profile_picture
              : `${API_BASE_URL.replace("/api", "")}/uploads/${res.data.profile_picture}`
          );
        }
      } catch (err) {
        console.log(err);
        Toast.show({ type: "error", text1: "Failed to load profile" });
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const localUri = result.assets[0].uri;
      setImage(localUri);
      setNewImageUri(localUri);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.username || !profile.address) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) =>
        formData.append(key, value.toString())
      );

      if (newImageUri) {
        const filename = newImageUri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profile_picture", {
          uri: Platform.OS === "ios" ? newImageUri.replace("file://", "") : newImageUri,
          name: filename,
          type,
        } as any);
      }

      const token = await AsyncStorage.getItem("token");
      await api.put("/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.show({ type: "success", text1: "Profile updated successfully" });
      setNewImageUri(null);
    } catch (err: any) {
      console.log(err);
      Toast.show({ type: "error", text1: "Failed to update profile", text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Social" as never)} // or navigation.goBack()
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile Avatar */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <Image
              source={image ? { uri: image } : require("../../assets/default-profile.jpg")}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <MaterialIcons name="photo-camera" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>Edit Your Profile</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Username */}
          <InputField
            icon="person"
            placeholder="Username"
            value={profile.username}
            onChangeText={(v) => handleInputChange("username", v)}
          />

          {/* Address */}
          <InputField
            icon="home"
            placeholder="Address"
            value={profile.address}
            onChangeText={(v) => handleInputChange("address", v)}
          />

          {/* Contact Number with Country Picker */}
          <View style={styles.contactWrapper}>
                <Picker
                  selectedValue={profile.countryCode}
                  style={styles.countryCodePicker}
                  onValueChange={(value) => handleInputChange("countryCode", value)}
                >
                  <Picker.Item label="PH +63" value="+63" />
                  <Picker.Item label="HK +852" value="+852" />
                  {/* ✅ Add more as needed manually */}
                </Picker>

                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Contact Number"
                  keyboardType="phone-pad"
                  value={profile.contact}
                  onChangeText={(v) => handleInputChange("contact", v)}
                />
              </View>

          {/* Age Stepper */}
          <View style={styles.ageWrapper}>
            <TouchableOpacity
              onPress={() => handleInputChange("age", Math.max(0, profile.age - 1))}
              style={styles.ageButton}
            >
              <MaterialIcons name="remove" size={20} color="#2563eb" />
            </TouchableOpacity>
            <Text style={styles.ageText}>{profile.age}</Text>
            <TouchableOpacity
              onPress={() => handleInputChange("age", profile.age + 1)}
              style={styles.ageButton}
            >
              <MaterialIcons name="add" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {/* Status Dropdown */}
          <View style={styles.pickerWrapper}>
            <MaterialIcons name="favorite" size={20} color="#6b7280" style={styles.inputIcon} />
            <Picker
              selectedValue={profile.status}
              style={{ flex: 1 }}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <Picker.Item label="Select Status" value="" />
              <Picker.Item label="Single" value="Single" />
              <Picker.Item label="Married" value="Married" />
              <Picker.Item label="Complicated" value="Complicated" />
            </Picker>
          </View>
        </View>

        {/* Save Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
        ) : (
          <Button title="Save Changes" onPress={handleSaveProfile} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ✅ Reusable Input Field Component
function InputField({ icon, placeholder, value, onChangeText }: any) {
  return (
    <View style={styles.inputWrapper}>
      <MaterialIcons name={icon} size={20} color="#6b7280" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { alignItems: "center", padding: 24 },
  avatarWrapper: { alignItems: "center", marginBottom: 20 },
  header: {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  backText: {
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 6,
    fontWeight: "500",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#e2e8f0",
    elevation: 5,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#2563eb",
    borderRadius: 25,
    padding: 8,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  profileTitle: { fontSize: 20, fontWeight: "600", marginTop: 12, color: "#1e293b" },
  formCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  contactWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  ageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  ageButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    marginHorizontal: 12,
  },
  ageText: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  countryCodePicker: {
  width: 75,
  backgroundColor: "#f8fafc",
  },
});

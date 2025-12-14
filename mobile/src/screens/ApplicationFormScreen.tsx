import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { saveStep } from "../utils/stepStorage";

export default function ApplicationFormScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"personal" | "contact" | "employment" | "membership">("personal");
  const [currentStep, setCurrentStep] = useState<string>("Application");
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",

    // Contact Info
    email: "",
    phone: "",
    address: "",

    // Employment Info
    occupation: "",
    company: "",
    income: "",

    // Membership Info
    preferredRole: "",
    referralCode: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 🔄 Save progress automatically whenever currentStep changes
        useEffect(() => {
          const saveProgress = async () => {
            await saveStep(currentStep);
            console.log(`[STEP] Progress saved: Step ${currentStep}`);
          };
          saveProgress();
        }, [currentStep]);

  const handleSubmit = () => {
    // Simple validation
    /* if (!formData.firstName || !formData.email) {
      Alert.alert("Incomplete Form", "Please fill all required fields.");
      return;
    }

    Alert.alert("✅ Application Submitted", "Your details have been sent for verification."); */
    navigation.navigate("FinalReview" as never);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <>
            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={formData.firstName}
              onChangeText={(t) => handleChange("firstName", t)}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={formData.lastName}
              onChangeText={(t) => handleChange("lastName", t)}
            />
            <TextInput
              placeholder="Birth Date (YYYY-MM-DD)"
              style={styles.input}
              value={formData.birthDate}
              onChangeText={(t) => handleChange("birthDate", t)}
            />
            <TextInput
              placeholder="Gender"
              style={styles.input}
              value={formData.gender}
              onChangeText={(t) => handleChange("gender", t)}
            />
          </>
        );

      case "contact":
        return (
          <>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={formData.email}
              onChangeText={(t) => handleChange("email", t)}
            />
            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={formData.phone}
              onChangeText={(t) => handleChange("phone", t)}
            />
            <TextInput
              placeholder="Address"
              style={styles.input}
              value={formData.address}
              onChangeText={(t) => handleChange("address", t)}
            />
          </>
        );

      case "employment":
        return (
          <>
            <TextInput
              placeholder="Occupation / Business"
              style={styles.input}
              value={formData.occupation}
              onChangeText={(t) => handleChange("occupation", t)}
            />
            <TextInput
              placeholder="Company / Business Name"
              style={styles.input}
              value={formData.company}
              onChangeText={(t) => handleChange("company", t)}
            />
            <TextInput
              placeholder="Monthly Income"
              style={styles.input}
              value={formData.income}
              onChangeText={(t) => handleChange("income", t)}
            />
          </>
        );

      case "membership":
        return (
          <>
            <TextInput
              placeholder="Preferred Role (e.g., Member, Vendor, Investor)"
              style={styles.input}
              value={formData.preferredRole}
              onChangeText={(t) => handleChange("preferredRole", t)}
            />
            <TextInput
              placeholder="Referral Code (Optional)"
              style={styles.input}
              value={formData.referralCode}
              onChangeText={(t) => handleChange("referralCode", t)}
            />
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership Application</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["personal", "contact", "employment", "membership"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Ionicons
              name={
                tab === "personal"
                  ? "person-outline"
                  : tab === "contact"
                  ? "call-outline"
                  : tab === "employment"
                  ? "briefcase-outline"
                  : "id-card-outline"
              }
              size={20}
              color={activeTab === tab ? "#fff" : "#6b7280"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Form Fields */}
      <ScrollView contentContainerStyle={styles.formContainer}>{renderTabContent()}</ScrollView>

      {/* Buttons */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  formContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

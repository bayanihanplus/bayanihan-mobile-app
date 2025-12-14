import React,{useState,useEffect} from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { saveStep } from "../utils/stepStorage";
import Toast from "react-native-toast-message";

export default function FinalReviewScreen({ navigation, route }: any) {

  const [currentStep,setCurrentStep] = useState<string>("FinalReview");
  
  // 🔄 Save progress automatically whenever currentStep changes
    useEffect(() => {
      const saveProgress = async () => {
        await saveStep(currentStep);
        console.log(`[STEP] Progress saved: Step ${currentStep}`);
      };
      saveProgress();
    }, [currentStep]);

  // In a real app you would pass form data through route.params
  const mockData = {
    fullName: "Juan Dela Cruz",
    address: "Quezon City, Philippines",
    email: "juan@example.com",
    contact: "+63 912 345 6789",
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
      /* Toast.show({
        type: "success",
        text1: "Application Submitted",
        text2: `Thank you! Your application has been sent successfully."`,
        position: "top",
        visibilityTime: 3000,
      }); */
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Your Application</Text>
      <Text style={styles.subtitle}>Please confirm your details before submission.</Text>

      <View style={styles.reviewCard}>
        <Ionicons name="person-outline" size={22} color="#2563eb" />
        <View style={styles.reviewInfo}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{mockData.fullName}</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <Ionicons name="home-outline" size={22} color="#2563eb" />
        <View style={styles.reviewInfo}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{mockData.address}</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <Ionicons name="mail-outline" size={22} color="#2563eb" />
        <View style={styles.reviewInfo}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{mockData.email}</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <Ionicons name="call-outline" size={22} color="#2563eb" />
        <View style={styles.reviewInfo}>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{mockData.contact}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate("ApplicationReviewPending")}>
        <Text style={styles.submitText}>Submit Application</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Go Back & Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 25,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewInfo: {
    marginLeft: 10,
  },
  label: {
    color: "#6b7280",
    fontSize: 13,
  },
  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    marginTop: 10,
  },
  backText: {
    color: "#2563eb",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

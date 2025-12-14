import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { saveStep } from "../utils/stepStorage";
export default function OrientationScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<string>("Orientation");

  // 🔄 Save progress automatically whenever currentStep changes
      useEffect(() => {
        const saveProgress = async () => {
          await saveStep(currentStep);
          console.log(`[STEP] Progress saved: Step ${currentStep}`);
        };
        saveProgress();
      }, [currentStep]);

  const handleContinue = () => {
    navigation.navigate("Application" as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../../assets/bayanihanLogo.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to Cooperative!</Text>
      <Text style={styles.subtitle}>
        Before joining, please take a quick orientation about our values and mission.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          🤝 <Text style={{ fontWeight: "bold" }}>Community First:</Text> We help each other grow.
        </Text>
        <Text style={styles.cardText}>
          💬 <Text style={{ fontWeight: "bold" }}>Respect Always:</Text> Keep conversations kind and
          positive.
        </Text>
        <Text style={styles.cardText}>
          🌱 <Text style={{ fontWeight: "bold" }}>Grow Together:</Text> Share opportunities, learn, and
          support one another.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("Application" as never)}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#f9fafb",
  },
  image: {
    width: 250,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: "100%",
    elevation: 2,
  },
  cardText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    color: "#6c757d",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});

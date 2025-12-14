import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MiniSplash from "../../components/MiniSplash";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const paymentMethods = ["GCash", "Bank", "PayNow HK", "FPS", "Cash Partner"];
const purposes = ["Savings", "Share Capital", "Emergency Fund"];

export default function AddSavings() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [purpose, setPurpose] = useState(purposes[0]);
  const [loading, setLoading] = useState(false);
  const [runningBalance, setRunningBalance] = useState(50000); // dummy
  const [coopPoints, setCoopPoints] = useState(120); // dummy
  const navigation = useNavigation();

  const handleAddSavings = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newBalance = runningBalance + parseFloat(amount);
      setRunningBalance(newBalance);

      // Loyalty mechanic: +10 points per ₱1,000
      const earnedPoints = Math.floor(parseFloat(amount) / 1000) * 10;
      setCoopPoints(coopPoints + earnedPoints);

      Alert.alert(
        "Success",
        `₱${amount} added to ${purpose}.\nYou earned ${earnedPoints} Coop Points!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 1000); // simulate network/loading
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Mini Splash Loader */}
    <MiniSplash visible={loading} />

     <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/bayanihanLogo.png")} // or your logo
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Add Savings</Text>

        {/* Back Button inside header */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          placeholder="₱0.00"
          keyboardType="numeric"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
          >
            {paymentMethods.map((method) => (
              <Picker.Item key={method} label={method} value={method} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Purpose</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={purpose} onValueChange={(itemValue) => setPurpose(itemValue)}>
            {purposes.map((p) => (
              <Picker.Item key={p} label={p} value={p} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Summary & Loyalty */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Running Balance: ₱{runningBalance.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Current Coop Points: {coopPoints}</Text>
        {amount && parseFloat(amount) > 0 && (
          <Text style={styles.summaryText}>
            Add ₱{amount} today = Earn {Math.floor(parseFloat(amount) / 1000) * 10} Coop Points
          </Text>
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSavings}>
        <Ionicons name="add-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.addButtonText}>Add Savings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
  width: "100%",
  height: 120,
  backgroundColor: "#4F46E5", // example blue header background
  borderRadius: 12,
  marginBottom: 20,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  paddingTop: 20,
  },

  headerLogo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  headerBackButton: {
    position: "absolute",
    top: 35,
    left: 15,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
  }, 
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
   header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
    marginTop: 40,
  },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 15,
  },

  summaryBox: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
    marginBottom: 4,
  },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

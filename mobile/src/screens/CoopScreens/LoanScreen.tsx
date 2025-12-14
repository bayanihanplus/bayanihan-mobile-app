import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MiniSplash from "../../components/MiniSplash";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";

const loanTypes = [
  "Regular Loan",
  "Emergency Loan",
  "OFW Assistance Loan",
  "Business Loan",
  "Gadget Loan",
  "Education Loan",
];

export default function LoanScreen() {
  const navigation = useNavigation();
  const [activeLoan, setActiveLoan] = useState({
    amount: 10000,
    outstanding: 5000,
    nextDue: "2025-12-05",
    status: "Active",
  });

  const [calculator, setCalculator] = useState({
    amount: 5000,
    term: 6, // months
    interestRate: 2, // % per month
  });

  const [selectedLoanType, setSelectedLoanType] = useState(loanTypes[0]);
  const [loading, setLoading] = useState(false);

  const calculateTotalRepayment = () => {
    const { amount, term, interestRate } = calculator;
    return amount + (amount * (interestRate / 100) * term);
  };

  const handleApplyLoan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Loan Application Submitted",
        `Your ${selectedLoanType} application has been submitted.\nApproval timeline: 3-5 business days.`,
        [{ text: "OK" }]
      );
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <MiniSplash visible={loading} />

      <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/bayanihanLogo.png")} // or your logo
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Loan Dashboard</Text>

        {/* Back Button inside header */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Loan Dashboard */}
      <View style={styles.dashboard}>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardLabel}>Active Loans</Text>
          <Text style={styles.dashboardValue}>₱{activeLoan.amount}</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardLabel}>Outstanding Balance</Text>
          <Text style={styles.dashboardValue}>₱{activeLoan.outstanding}</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardLabel}>Next Due Date</Text>
          <Text style={styles.dashboardValue}>{activeLoan.nextDue}</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardLabel}>Status</Text>
          <Text style={styles.dashboardValue}>{activeLoan.status}</Text>
        </View>
      </View>

      {/* Loan Calculator */}
      <Text style={styles.sectionTitle}>Loan Calculator</Text>
      <View style={styles.calculator}>
        <Text style={styles.label}>Amount: ₱{calculator.amount}</Text>
        <Slider
          minimumValue={1000}
          maximumValue={50000}
          step={500}
          value={calculator.amount}
          onValueChange={(val) => setCalculator({ ...calculator, amount: val })}
        />
        <Text style={styles.label}>Term (months):</Text>
        <Picker
          selectedValue={calculator.term}
          onValueChange={(val) => setCalculator({ ...calculator, term: val })}
        >
          {[3, 6, 12, 18, 24].map((m) => (
            <Picker.Item key={m} label={`${m} months`} value={m} />
          ))}
        </Picker>
        <Text style={styles.label}>Interest: {calculator.interestRate}% / month</Text>
        <Text style={styles.label}>Total Repayment: ₱{calculateTotalRepayment()}</Text>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Requirements:</Text>
          <Text>- Valid ID</Text>
          <Text>- Proof of Income</Text>
          <Text>- Signed Agreement</Text>
        </View>
      </View>

      {/* Loan Types */}
      <Text style={styles.sectionTitle}>Loan Types</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {loanTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.loanTypeCard,
              selectedLoanType === type && { borderColor: "#4F46E5", borderWidth: 2 },
            ]}
            onPress={() => setSelectedLoanType(type)}
          >
            <Text style={styles.loanTypeText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Apply Now */}
      <TouchableOpacity style={styles.applyButton} onPress={handleApplyLoan}>
        <Ionicons name="paper-plane" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.applyButtonText}>Apply Now</Text>
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
  dashboard: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  dashboardCard: {
    width: "48%",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  dashboardLabel: { fontSize: 14, fontWeight: "600", color: "#4F46E5" },
  dashboardValue: { fontSize: 18, fontWeight: "700", marginTop: 5, color: "#111827" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 10, marginTop: 20 },

  calculator: { backgroundColor: "#F9FAFB", padding: 15, borderRadius: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },

  loanTypeCard: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  loanTypeText: { fontSize: 14, fontWeight: "600", color: "#111827" },

  applyButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

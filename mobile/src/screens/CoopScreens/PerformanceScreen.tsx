import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import MiniSplash from "../../components/MiniSplash";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

// Dummy financial data
const financialSnapshot = [
  { id: 1, label: "Total Members", value: 1200 },
  { id: 2, label: "Total Savings", value: "₱5,000,000" },
  { id: 3, label: "Total Loans Released", value: "₱2,500,000" },
  { id: 4, label: "PAR %", value: "3.2%" },
];

// Dummy coop projects
const coopProjects = [
  { id: 1, name: "Organic Fertilizer Plant", revenue: "₱1,200,000", profit: "₱200,000" },
  { id: 2, name: "Logistics Expansion", revenue: "₱800,000", profit: "₱150,000" },
  { id: 3, name: "MyChewy Milk Tea Franchise", revenue: "₱500,000", profit: "₱120,000" },
];

export default function PerformanceScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = (title: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Download Complete", `${title} PDF downloaded successfully.`);
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
        <Text style={styles.header}>Financial Health Snapshot</Text>

        {/* Back Button inside header */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Snapshot Cards */}
      <View style={styles.cardsContainer}>
        {financialSnapshot.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Assets / Liabilities Charts */}
      <Text style={styles.sectionTitle}>Assets vs Liabilities</Text>
      <BarChart
            data={{
                labels: ["Assets", "Liabilities"],
                datasets: [{ data: [5000000, 3500000] }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="₱"
            yAxisSuffix="" // <-- Add this line
            chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(79,70,229,${opacity})`,
                labelColor: () => "#6B7280",
            }}
            style={{ borderRadius: 16, marginBottom: 20 }}
        />
      {/* Annual Performance Report */}
      <Text style={styles.sectionTitle}>Annual Performance Report</Text>
      <View style={styles.reportBox}>
        <Text style={styles.reportText}>CDA Required PDF</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownloadPDF("Annual Performance")}
        >
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.downloadText}>Download PDF</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.reportSub}>AGM Highlights:</Text>
      <Text>- Approval of new board members</Text>
      <Text>- Dividend declaration for FY2025</Text>
      <Text>- Discussion on new coop projects</Text>

      {/* Coop Projects */}
      <Text style={styles.sectionTitle}>Coop Projects</Text>
      <FlatList
        data={coopProjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text>Revenue: {item.revenue}</Text>
            <Text>Profit: {item.profit}</Text>
          </View>
        )}
      />
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

  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  cardLabel: { fontSize: 14, fontWeight: "600", color: "#4F46E5" },
  cardValue: { fontSize: 18, fontWeight: "700", marginTop: 5, color: "#111827" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 10, marginTop: 20 },

  reportBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  downloadButton: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadText: { color: "#fff", fontWeight: "700", marginLeft: 5 },

  reportSub: { fontSize: 14, fontWeight: "600", marginBottom: 5, marginTop: 10 },

  projectCard: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  projectName: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
});

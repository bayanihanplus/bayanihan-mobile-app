import React,{useState,useEffect,useCallback} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";
import MiniSplash from "../../components/MiniSplash";
import Button from "../../components/Button";
const screenWidth = Dimensions.get("window").width;

const summaryData = [
  { id: 1, icon: "wallet", label: "Total Savings", value: "₱50,000", colors: ["#4F46E5", "#6366F1"] },
  { id: 2, icon: "layers", label: "Share Capital", value: "₱10,000", colors: ["#2563EB", "#3B82F6"] },
  { id: 3, icon: "time", label: "Time Deposit", value: "₱15,000", colors: ["#0EA5E9", "#38BDF8"] },
  { id: 4, icon: "gift", label: "Patronage Refund", value: "₱2,000 Pending", colors: ["#14B8A6", "#2DD4BF"] },
  { id: 5, icon: "cash", label: "Dividends This Year", value: "₱1,200", colors: ["#10B981", "#34D399"] },
  { id: 6, icon: "trophy", label: "Coop Rewards", value: "120 Points", colors: ["#F59E0B", "#FBBF24"] },
];

export default function SavingsScreen() {
const navigation = useNavigation();
const [loading, setLoading] = useState(true);

   // Trigger MiniSplash every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1400); // match animation
      return () => clearTimeout(timer);
    }, [])
  );

  return (
    
    <View style={{ flex: 1 }}>
     <MiniSplash visible={loading} />

      <View style={styles.headerContainer}>
          <Image
            source={require("../../../assets/bayanihanLogo.png")} // or your logo
            style={styles.headerLogo}
          />
          <Text style={styles.headerTitle}>Savings Overview</Text>

          {/* Back Button inside header */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 80 }}
        >

            <Text style={styles.header}>Savings Overview</Text>

            {/* Summary Cards */}
            <View style={styles.cardsContainer}>
            {summaryData.map((item) => (
                <LinearGradient key={item.id} colors={item.colors} style={styles.card}>
                <Ionicons name={item.icon} size={26} color="#fff" />
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardValue}>{item.value}</Text>
                </LinearGradient>
            ))}
            </View>

            {/* Modern Chart */}
            <Text style={styles.sectionTitle}>Savings Growth</Text>

            <View style={styles.chartWrapper}>
            <LineChart
                data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                    { data: [5000, 7000, 9000, 15000, 20000, 25000], strokeWidth: 3 },
                ],
                }}
                width={screenWidth - 40}
                height={220}
                yAxisLabel="₱"
                fromZero
                withShadow={true}
                segments={5}
                bezier
                chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: () => "#6B7280",
                style: { borderRadius: 16 },
                propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#4F46E5",
                },
                }}
                style={{ borderRadius: 16 }}
            />
            </View>

            {/* Insights */}
            <View style={styles.insightBox}>
            <Ionicons name="analytics" size={22} color="#4F46E5" />
            <Text style={styles.insightText}>
                You're saving better than 
                <Text style={{ fontWeight: "700" }}> 72%</Text> of members!
            </Text>
            </View>

            {/* Actions */}
            <Text style={styles.sectionTitle}>Actions</Text>

              <View style={{ flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
                <Button icon="add-circle" text="Add" onPress={() => console.log("Add")} />
                <Button icon="arrow-down-circle" text="Withdraw" onPress={() => console.log("Withdraw")} />
                <Button icon="swap-horizontal" text="Transfer" onPress={() => console.log("Transfer")} />
                <Button icon="calendar" text="Schedule" onPress={() => console.log("Schedule")} />
              </View>

        </ScrollView>
        </View>

  );
}


const styles = StyleSheet.create({
 headerContainer: {
  width: "100%",
  height: 120,
  backgroundColor: "#4F46E5", // example blue header background
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
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
    
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 20,
    marginBottom: 10,
  },

  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  chartWrapper: {
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 16,
  elevation: 2,
  marginBottom: 20,
  },
  card: {
    width: "48%",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },

  cardLabel: {
    color: "#fff",
    marginTop: 10,
    fontSize: 13,
    opacity: 0.9,
  },

  cardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 3,
  },

  victoryWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 2,
  },

  insightBox: {
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  insightText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
    flex: 1,
  },

  actionsContainer: { 
    marginTop: 10 ,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },

  actionButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },

  actionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

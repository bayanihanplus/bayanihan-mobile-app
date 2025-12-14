import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CoopScreen({ navigation }: any) {
  const [isMember, setIsMember] = useState(false); // first-time view toggle

  if (!isMember) {
    // 🟦 FIRST-TIME SCREEN
    return (
      <View style={styles.welcomeContainer}>
        <Ionicons name="people-circle-outline" size={90} color="#3B82F6" />
        <Text style={styles.welcomeTitle}>Join the Coop</Text>
        <Text style={styles.welcomeText}>
          Join a community that grows together. Get access to exclusive member benefits, savings, and opportunities.
        </Text>

        <TouchableOpacity
        style={styles.joinButton}
        onPress={() => navigation.navigate("OnboardingHub")}
        >
        <Ionicons name="log-in-outline" size={22} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.joinText}>Join the Cooperative</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🟩 MEMBER SCREEN (after joining)
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="people-circle-outline" size={48} color="#3B82F6" />
        <Text style={styles.title}>Bayanihan Cooperative</Text>
        <Text style={styles.subtitle}>Empowering members through unity and growth</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Member Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Member ID:</Text>
          <Text style={styles.value}>#CP-2025-001</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: "#10B981" }]}>Active</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Joined:</Text>
          <Text style={styles.value}>Jan 5, 2025</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridButton}>
          <Ionicons name="wallet-outline" size={28} color="#60A5FA" />
          <Text style={styles.gridText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton}>
          <Ionicons name="cash-outline" size={28} color="#FBBF24" />
          <Text style={styles.gridText}>Loans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton}>
          <Ionicons name="document-text-outline" size={28} color="#34D399" />
          <Text style={styles.gridText}>Statements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton}>
          <Ionicons name="calendar-outline" size={28} color="#A78BFA" />
          <Text style={styles.gridText}>Events</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.cardTitle}>About the Cooperative</Text>
        <Text style={styles.desc}>
          Our cooperative is built on the spirit of bayanihan — helping one another achieve financial stability
          and community progress through shared ownership, trust, and sustainable programs.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
  },
  // 🟦 Welcome screen
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    color: "#F9FAFB",
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  welcomeText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  joinButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  joinText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  // 🟩 Member screen
  header: { alignItems: "center", marginVertical: 16 },
  title: {
    fontSize: 22,
    color: "#F9FAFB",
    fontWeight: "bold",
    marginTop: 8,
  },
  subtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center", marginTop: 4 },
  card: { backgroundColor: "#1F2937", borderRadius: 12, padding: 16, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#E5E7EB", marginBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#9CA3AF", fontSize: 14 },
  value: { color: "#F3F4F6", fontSize: 14 },
  sectionTitle: { color: "#D1D5DB", fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridButton: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    width: "47%",
    height: 100,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  gridText: { color: "#E5E7EB", fontSize: 14, marginTop: 8 },
  desc: { color: "#9CA3AF", fontSize: 13, lineHeight: 20 },
});

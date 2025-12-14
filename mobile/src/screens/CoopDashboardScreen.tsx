import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";

export default function  CoopDashboard({ navigation }: any){
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
         source={require("../../assets/bayanihanLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Bayanihan Cooperative</Text>
        <Text style={styles.subtitle}>Welcome back, Emjay!</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>245</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₱120K</Text>
          <Text style={styles.statLabel}>Funds</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("MembersScreen")}
        >
          <Text style={styles.actionText}>👥 Manage Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("ProjectsScreen")}
        >
          <Text style={styles.actionText}>📁 View Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("FinanceScreen")}
        >
          <Text style={styles.actionText}>💰 Finance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AnnouncementsScreen")}
        >
          <Text style={styles.actionText}>📢 Announcements</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  logo: { width: 80, height: 80, marginBottom: 10, borderRadius: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 16, color: "#e0e7ff" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statNumber: { fontSize: 20, fontWeight: "700", color: "#1e3a8a" },
  statLabel: { fontSize: 14, color: "#64748b" },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


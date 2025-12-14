import React, { useState,useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MiniSplash from "../../components/MiniSplash"; // adjust path
import { useNavigation,useFocusEffect } from "@react-navigation/native";

const dummyMembers = [
  {
    id: "M001",
    name: "Juan Dela Cruz",
    country: "Thailand",
    level: "Regular",
    share: 10000,
    savings: 5000,
    loans: 2000,
    attendance: 8,
    cluster: "A1",
  },
  {
    id: "M002",
    name: "Maria Santos",
    country: "Philippines",
    level: "Associate",
    share: 5000,
    savings: 2000,
    loans: 0,
    attendance: 5,
    cluster: "B3",
  },
  // ... more members
];

export default function MemberScreen() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  const filteredMembers = dummyMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.id.toLowerCase().includes(search.toLowerCase())
  );

  const openMember = (member) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSelectedMember(member);
    }, 800); // MiniSplash duration
  };
    // Trigger MiniSplash every time screen comes into focus
    useFocusEffect(
      useCallback(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1400); // match animation
        return () => clearTimeout(timer);
      }, [])
    );
  return (
    <View style={styles.container}>
      {/* MiniSplash overlay */}
      <MiniSplash visible={loading} />

     <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/bayanihanLogo.png")} // or your logo
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Members</Text>
        <Text style={styles.subHeader}>
          Transparency, Networking, and Identity
        </Text>
        {/* Back Button inside header */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Search by name or ID"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Member Directory */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => openMember(item)}
          >
            <View>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberInfo}>
                {item.id} • {item.country} •{" "}
                <Text
                  style={[
                    styles.badge,
                    item.level === "Regular" ? styles.regular : styles.associate,
                  ]}
                >
                  {item.level}
                </Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
        style={{ marginTop: 10 }}
      />

      {/* Member Profile Modal */}
      <Modal visible={!!selectedMember} transparent animationType="slide">
        
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            style={styles.modalContent}
          >
            <TouchableOpacity
              onPress={() => setSelectedMember(null)}
              style={{ alignSelf: "flex-end" }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {selectedMember && (
              <ScrollView>
                <Text style={styles.modalName}>{selectedMember.name}</Text>
                <Text style={styles.modalInfo}>Member ID: {selectedMember.id}</Text>
                <Text style={styles.modalInfo}>
                  Level: {selectedMember.level}
                </Text>
                <Text style={styles.modalInfo}>
                  Country: {selectedMember.country}
                </Text>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <Text style={styles.statLabel}>
                    Share Capital: ₱{selectedMember.share}
                  </Text>
                  <Text style={styles.statLabel}>
                    Savings: ₱{selectedMember.savings}
                  </Text>
                  <Text style={styles.statLabel}>
                    Loans: ₱{selectedMember.loans}
                  </Text>
                  <Text style={styles.statLabel}>
                    Cluster: {selectedMember.cluster}
                  </Text>

                  {/* Attendance progress bar */}
                  <Text style={[styles.statLabel, { marginTop: 10 }]}>
                    Attendance:
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        { width: `${(selectedMember.attendance / 10) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={{ color: "#E0E7FF", marginTop: 2 }}>
                    {selectedMember.attendance}/10 events
                  </Text>
                </View>

                {/* Community Actions */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Message Coop</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Request Assistance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Request Certificate</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </View>
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
  subHeader: { fontSize: 14, color: "#fff948ff", marginBottom: 15 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 45,
  },

  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  memberName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  memberInfo: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  badge: {
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    color: "#fff",
    fontSize: 11,
  },
  regular: { backgroundColor: "#4F46E5" },
  associate: { backgroundColor: "#10B981" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
  },
  modalName: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 5 },
  modalInfo: { fontSize: 14, color: "#E0E7FF", marginBottom: 3 },

  statsContainer: { marginTop: 15 },
  statLabel: { fontSize: 14, color: "#E0E7FF", marginBottom: 3 },

  progressBarBackground: {
    height: 8,
    backgroundColor: "#D1D5DB",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#10B981",
    borderRadius: 6,
  },

  actionsContainer: { marginTop: 20 },
  actionButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  actionText: { color: "#4F46E5", fontWeight: "700" },
});

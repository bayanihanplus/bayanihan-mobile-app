import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MiniSplash from "../../components/MiniSplash";
import { useNavigation } from "@react-navigation/native";

// Dummy event data
const events = [
  {
    id: 1,
    type: "Webinar",
    title: "Financial Literacy Webinar",
    date: "2025-12-01",
    time: "2:00 PM",
    certificate: true,
  },
  {
    id: 2,
    type: "TESDA Course",
    title: "Agriculture Skills Training",
    date: "2025-12-05",
    time: "9:00 AM",
    certificate: true,
  },
  {
    id: 3,
    type: "Government Service Day",
    title: "SSS Outreach",
    date: "2025-12-10",
    time: "10:00 AM",
    certificate: false,
  },
];

export default function EventsScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleJoinEvent = (title: string) => {
    Alert.alert("Event Joined", `You have joined: ${title}`);
  };

  const handleAddToCalendar = (title: string) => {
    Alert.alert("Calendar", `${title} added to your calendar.`);
  };

  const handleDownloadCertificate = (title: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Certificate Downloaded", `${title} certificate downloaded.`);
    }, 1000);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventType}>{item.type}</Text>
        <Text style={styles.eventDate}>{item.date} | {item.time}</Text>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleJoinEvent(item.title)}
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.actionText}>Join</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#10B981" }]}
          onPress={() => handleAddToCalendar(item.title)}
        >
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.actionText}>Add to Calendar</Text>
        </TouchableOpacity>

        {item.certificate && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
            onPress={() => handleDownloadCertificate(item.title)}
          >
            <Ionicons name="document" size={18} color="#fff" />
            <Text style={styles.actionText}>Certificate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
       <MiniSplash visible={loading} />

       <View style={styles.headerContainer}>
          <Image
            source={require("../../../assets/bayanihanLogo.png")} // or your logo
            style={styles.headerLogo}
          />
          <Text style={styles.headerTitle}>Gov. Events</Text>

          {/* Back Button inside header */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
        </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
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

  eventCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  eventType: { fontSize: 14, fontWeight: "600", color: "#4F46E5" },
  eventDate: { fontSize: 12, color: "#6B7280" },
  eventTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 10 },

  actionsRow: { flexDirection: "row", flexWrap: "wrap" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 5 },
});

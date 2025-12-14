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

// Dummy announcements
const announcements = [
  {
    id: 1,
    title: "Urgent: System Maintenance",
    category: "Urgent Notices",
    date: "2025-11-26",
    message: "Our system will be down for maintenance from 10 PM to 2 AM.",
    pdf: null,
  },
  {
    id: 2,
    title: "AGM Schedule FY2025",
    category: "AGM Schedule",
    date: "2025-11-20",
    message: "Annual General Meeting will be held on December 10, 2025.",
    pdf: "agm_schedule_fy2025.pdf",
  },
  {
    id: 3,
    title: "New Partner Benefits",
    category: "New Partners & Benefits",
    date: "2025-11-15",
    message: "We partnered with Coop Bank HK for exclusive member loans.",
    pdf: null,
  },
];

export default function AnnouncementScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const handleDownloadPDF = (pdfName: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Download Complete", `${pdfName} downloaded successfully.`);
    }, 1000);
  };

  const renderAnnouncement = ({ item }) => (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementCategory}>{item.category}</Text>
      </View>
      <Text style={styles.announcementDate}>{item.date}</Text>
      <Text style={styles.announcementMessage}>{item.message}</Text>
      {item.pdf && (
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={() => handleDownloadPDF(item.pdf)}
        >
          <Ionicons name="document" size={18} color="#fff" style={{ marginRight: 5 }} />
          <Text style={styles.pdfText}>Download PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

       <MiniSplash visible={loading} />

      <View style={styles.headerContainer}>
        <Image
          source={require("../../../assets/bayanihanLogo.png")} 
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Announcements</Text>

          {/* Floating Back Button */}
        <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAnnouncement}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
   /* 🍎 Floating Glass Back Button */
  floatingBack: {
    position: "absolute",
    top: 35,
    left: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 4,

    // iOS glass effect
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

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
  announcementCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  announcementTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  announcementCategory: { fontSize: 12, fontWeight: "600", color: "#4F46E5" },
  announcementDate: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  announcementMessage: { fontSize: 14, color: "#374151", marginBottom: 10 },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  pdfText: { color: "#fff", fontWeight: "700" },
});

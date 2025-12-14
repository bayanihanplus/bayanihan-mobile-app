import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotifications, Notification } from "../context/NotificationContext";
import { API_BASE_URL } from "../api/api";
import { Ionicons } from "@expo/vector-icons";

type FriendRequest = {
  id: string;
  username: string;
  profile_picture?: string;
  created_at: string;
};

export default function NotificationScreen() {
  const { notifications, markAsRead, unreadByType } = useNotifications();
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    markAsRead(undefined, "friend_request");
  }, []);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/friends/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setIncoming(data.incoming || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFriendAction = async (requesterId: string, action: "accept" | "decline") => {
    try {
      const token = await AsyncStorage.getItem("token");

      await fetch(`${API_BASE_URL}/friends/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId }),
      });

      fetchFriendRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
  <View style={styles.friendRequestCard}>
    <View style={styles.friendHeader}>
      {/* Avatar */}
       {/* Avatar or default icon */}
      {item.profile_picture ? (
        <Image
          source={{ uri: `https://bayanihanplus.com/uploads/${item.profile_picture}` }}
          style={styles.avatar}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={50} color="#ccc" />
      )}

      {/* Name and message */}
      <View style={styles.nameMessage}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.message}>sent you a friend request</Text>
      </View>

      {/* Buttons on the right */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => handleFriendAction(item.id, "accept")}>
          <Text style={[styles.buttonText, styles.acceptText]}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleFriendAction(item.id, "decline")}>
          <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {loading && <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />}

      {/* FRIEND REQUESTS */}
      {incoming.length > 0 && (
        <>
          <FlatList
            data={incoming}
            keyExtractor={(item) => item.id}
            renderItem={renderFriendRequest}
            contentContainerStyle={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 12 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.message}>{item.title}</Text> {/* only show title */}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  sectionTitle: { fontSize: 18, marginTop: 16, marginBottom: 8, fontWeight: "600" },
  unreadCount: { fontSize: 14, color: "#555", marginBottom: 8 },

  // Friend request card with silver-gray background
  friendRequestCard: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
  },

  friendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nameMessage: {
    flex: 1,
    marginLeft: 10,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12, // spacing between Accept and Decline
  },

  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: "#e5e7eb" },

  username: { fontWeight: "700", fontSize: 16, marginBottom: 2 },
  message: { fontSize: 16, color: "#333" }, // darker, cleaner text for titles

  actionsColumn: { marginTop: 6, flexDirection: "row", gap: 16 },

  buttonText: { fontSize: 14, fontWeight: "600" },
  acceptText: { color: "#4caf50" },
  declineText: { color: "#f44336" },

  notificationCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
});

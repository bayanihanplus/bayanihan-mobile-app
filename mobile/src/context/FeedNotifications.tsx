// FeedNotifications.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNotifications } from "../context/NotificationContext";
import { useAuthContext } from "./AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";

export const FeedNotifications = () => {
  const { notifications } = useNotifications();
  const { token } = useAuthContext();
  useWebSocket(token);
  console.log(notifications);
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={item.isRead ? styles.read : styles.unread}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
      )}
    />
  );
};
const styles = StyleSheet.create({
  row: { padding: 12, borderBottomWidth: 1, borderColor: "#ddd" },
  unread: { fontWeight: "bold" },
  read: { color: "#888" },
  time: { fontSize: 12, color: "#aaa" },
});
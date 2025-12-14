import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { GestureHandlerRootView, RectButton, Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import MiniSplash from "../components/MiniSplash"; // Your existing splash
import { API_BASE_URL } from "../api/api";

export default function FriendsScreen() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from API
      const res = await fetch(`${API_BASE_URL}/user/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const sendFriendRequest = (id: number) => {
    console.log("Send friend request to", id);
  };

  const renderRightActions = (trans: Animated.AnimatedInterpolation<number>, item: any) => {
    const isFriend = item.is_friend;
    const isPending = item.is_pending;

    return (
      <Animated.View
        style={{
          flexDirection: "row",
          transform: [{ translateX: trans }],
          marginVertical: 5,
        }}
      >
        {isFriend && (
          <RectButton
            style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
            onPress={() => console.log("Message →", item.id)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          </RectButton>
        )}
        {!isFriend && !isPending && (
          <RectButton
            style={[styles.actionBtn, { backgroundColor: "#2563eb" }]}
            onPress={() => sendFriendRequest(item.id)}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
          </RectButton>
        )}
        {isPending && (
          <RectButton style={[styles.actionBtn, { backgroundColor: "#6b7280" }]}>
            <Text style={{ color: "#fff", fontSize: 12 }}>Pending...</Text>
          </RectButton>
        )}
        <RectButton
          style={[styles.actionBtn, { backgroundColor: "#dc2626" }]}
          onPress={() => console.log("Block →", item.id)}
        >
          <Ionicons name="close-circle-outline" size={22} color="#fff" />
        </RectButton>
      </Animated.View>
    );
  };

  const calculateStatus = (lastActive: string) => {
    const last = new Date(lastActive).getTime();
    const diffMs = Date.now() - last;

    if (diffMs <= 60000) return { text: "Online", color: "#10b981" };

    const minutesAgo = Math.floor(diffMs / 60000);
    const hoursAgo = Math.floor(diffMs / (60 * 60000));
    const daysAgo = Math.floor(diffMs / (24 * 60 * 60000));

    if (minutesAgo < 60) return { text: `${minutesAgo} min ago`, color: "#6b7280" };
    if (hoursAgo < 24) return { text: `${hoursAgo} hr ago`, color: "#6b7280" };
    return { text: `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`, color: "#6b7280" };
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MiniSplash visible={loading} />

        {/* Search Input */}
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchUsers}
          renderItem={({ item }) => {
            const status = calculateStatus(item.last_active);

            return (
              <Swipeable
                overshootRight={false}
                renderRightActions={(progress) => renderRightActions(progress as any, item)}
              >
                <View style={styles.card}>
                  <Image
                    source={{ uri: `https://bayanihanplus.com/uploads/${item.profile_picture}` }}
                    style={styles.avatar}
                  />
                  <View style={{ marginLeft: 12, flex: 1, justifyContent: "center" }}>
                    <Text style={styles.name}>{item.username}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  </View>
                </View>
              </Swipeable>
            );
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  searchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  name: { fontSize: 16, fontWeight: "700", marginBottom: 4 },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: 44,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});

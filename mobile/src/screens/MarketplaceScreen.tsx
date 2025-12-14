import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddItemModal from "../context/Additem";
import ItemCard from "../context/ItemCard";
import { useAuthContext } from "../context/AuthContext";
import { appendFileToFormData } from "../utils/appendFileToFormData";
import * as ItemsAPI from "../utils/items";
import { API_BASE_URL } from "../api/api";
import { useNotifications } from "../context/NotificationContext";
import { socket } from "../context/NotificationContext";
import { useNavigation } from "@react-navigation/native";

export default function MarketplaceScreen() {
  const { token, user } = useAuthContext();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSendMessage = (item: any) => {
     
       if (socket.id === user.id) {
          console.log("⚠️ Target socket matches sender. Skipping emit.");
          return;
        }
       if (!socket) {
          console.log("⚠️ Socket not connected.");
          return;
        }

        if (!user) {
          console.log("⚠️ No user logged in.");
          return;
        }
       console.log("This is the User:",user);  
        const messagePayLoad = {
          fromUserId : user.id,
          toUserId : item.user_id,
          fromUserName: user.username || "Unknown", // ✅ add this
          message: `Hi! I'm Interested in ${item.item_name}`,
          touserName: item.username,
          item : {
            item_name : item.item_name,
            price: item.price,
            category : item.category,
            imageUri : item.imageUri,
          },
          type: "market_chat"
        }
      
      socket.emit("send_message",messagePayLoad);
        
    }
    
  const handleAddItem = (newItem: any) => {
    setItems(prev => [
      ...prev,
      { ...newItem, id: Date.now().toString(), user_id: user?.id, username: user?.username, mode: "preview" },
    ]);
  };

  const loadItems = async () => {

    setLoading(true);
    try {
        const backEnditems = await ItemsAPI.fetchItems(token);
        console.log("The Backend Items:",backEnditems);

        setItems(backEnditems);
    } catch (error) {
      console.error("Fetch Error :",error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
     loadItems();
  },[]);

  const handlePostItem = async (item: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("item_name", item.item_name);
      formData.append("price", item.price.toString());
      formData.append("category", item.category || "");
      formData.append("username", item.userName || "");

      if (item.imageUri) {
        await appendFileToFormData(formData, "image", {
          uri: item.imageUri,
          name: `item_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      console.log("Posting item...");
      
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to post item");

        setItems(prev => prev.map(i => (i.id === item.id ? { ...i, mode: "posting" } : i)));

        setItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, ...data.item, imageUri: i.imageUri, mode: "posted" }
              : i
          )
        );
      //  console.log("Posted item:", data);
      } catch (err: any) {
        console.error("Post Item Error:", err.message);
      } finally {
        setLoading(false);
      }
      
     
  };
  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />}
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ItemCard
            {...item}
            onConfirm={() => handlePostItem(item)}
            onMarketChat={() => handleSendMessage(item)}
            onRemove={() => setItems(prev => prev.filter(i => i.id !== item.id))}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
      {/* <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity> */}
      <AddItemModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(item) => {
          handleAddItem(item);
          setIsModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 8 },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#4caf50",
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    zIndex: 10,
  },
});

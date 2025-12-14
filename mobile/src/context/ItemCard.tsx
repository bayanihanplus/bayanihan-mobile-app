import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Item {
  user_id: number;
  username?: string;
  item_name: string;
  price: number;
  posted_date?: number;
  category?: string;
  imageUri?: string | null;
  mode: "preview" | "posted";
  onConfirm?: () => void;
  onMarketChat?: () => void;
  onRemove?: () => void;
}

const ItemCard: React.FC<Item> = ({
  user_id,
  username,
  item_name,
  price,
  category,
  imageUri,
  mode,
  onConfirm,
  onMarketChat,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      {/* ✅ Posted Badge */}
     
      {mode === "posted" && (
        <View style={styles.postedBadge}>
          <Text style={styles.postedBadgeText}>✔ Posted</Text>
        </View>
      )}

      {/* 🗑️ Remove Draft Button */}
      {mode === "preview" && onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      {/* 🖼 Product Image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {/* ℹ Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item_name}</Text>
        <Text style={styles.price}>₱{Number(price || 0).toLocaleString()}</Text>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        {username ? <Text style={styles.seller}>Seller: {username}</Text> : null}
      </View>

      {/* 🔘 Buttons */}
      {mode === "preview" ? (
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmText}>Post Item</Text>
        </TouchableOpacity>
      ) : (
        onMarketChat && (
          <TouchableOpacity style={styles.chatButton} onPress={onMarketChat}>
            <Text style={styles.chatButtonText}>💬 Chat with Seller</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: CARD_WIDTH,
    marginHorizontal: 4,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
  },
  postedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#4caf50",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  postedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 5,
    borderRadius: 20,
    zIndex: 10,
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28a745",
  },
  category: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  seller: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: "#0084ff",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  chatButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 8,
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ItemCard;

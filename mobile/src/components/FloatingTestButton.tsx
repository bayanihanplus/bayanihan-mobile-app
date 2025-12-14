import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../context/NotificationContext";

export default function FloatingTestButton() {
  const { addNotification } = useNotifications();

  const handlePress = () => {
    addNotification({
      id: Date.now().toString(),
      message: "This is a manual test a notification!",
      type: "system",
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  plus: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});

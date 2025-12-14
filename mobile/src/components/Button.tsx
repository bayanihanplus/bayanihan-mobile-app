import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: string;
  text: string;
  onPress?: () => void;
  size?: number; // icon size
  color?: string; // icon color
};

export default function ActionButton({
  icon,
  text,
  onPress,
  size = 28, // smaller icon
  color = "#2563eb",
}: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={size} color={color} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    margin: 6,       // smaller spacing
    width: 70,       // smaller width
  },
  iconContainer: {
    backgroundColor: "#e0e7ff", // soft blue
    borderRadius: 30,
    padding: 10,      // smaller padding
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  text: {
    marginTop: 4,     // less space below icon
    fontSize: 11,     // smaller font
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
});

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { useNotifications, Notification } from "../context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as Haptics from "expo-haptics";

const SCREEN_WIDTH = Dimensions.get("window").width;

type NotificationToastProps = {
  onOpenMessage?: (userId: string, userName: string) => void;
};

export function NotificationToast({ onOpenMessage }: NotificationToastProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { notifications, markAsRead } = useNotifications();
  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Add new notifications to the queue
  useEffect(() => {
  const newNotifications = notifications.filter(
    n => !queue.some(q => q.id === n.id) && (n.count ?? 0) > 0
    );
    if (newNotifications.length) {
      setQueue(prev => [...prev, ...newNotifications]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [notifications]);

  // Show next notification in queue
  useEffect(() => {
    
    if (!current && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);

      Animated.parallel([
        Animated.timing(translateY, { toValue: 50, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start(() => {

        const timeout = setTimeout(() => hideCurrent(), 3000);
        return () => clearTimeout(timeout);
        
      });
    }
   
  }, [queue, current]);

  const hideCurrent = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setQueue(prev => prev.slice(1));
      setCurrent(null);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(50 + gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) hideCurrent();
        else Animated.spring(translateY, { toValue: 50, useNativeDriver: true }).start();
      },
    })
  ).current;

  if (!current) return null;

  const getStyle = (type: Notification["type"]) => {
    switch (type) {
      case "friend_request":
        return { bg: "#d0f0c0", border: "#22c55e", icon: "person-add-outline" };
      case "message":
        return { bg: "#c0d0f0", border: "#3b82f6", icon: "chatbubble-outline" };
      case "market_chat":
        return { bg: "#fde2f0", border: "#ec4899", icon: "cart-outline" }; // ✅ pink for marketplace
      case "event":
        return { bg: "#fde2c0", border: "#f97316", icon: "calendar-outline" };
      default:
        return { bg: "#fef3c7", border: "#f59e0b", icon: "notifications-outline" };
    }
  };

  const styleProps = getStyle(current.type);

  const handleTap = () => {

    hideCurrent();
    markAsRead(current.id);
 
    if (current.type === "message") {
      const firstMessage = current.messages?.[0];
      const userName = firstMessage?.fromUserName ?? "Unknown";

      if (onOpenMessage) {
        // Pass the userId and userName to NotificationsScreen
        onOpenMessage(current.userId, userName);
      }
      return;
    }

    // Navigate other notification types normally
    switch (current.type) {
      case "friend_request":
        navigation.navigate("Friends");
        break;
      case "event":
        navigation.navigate("Events");
        break;
      default:
        navigation.navigate("Bayanihan");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.toast,
              {
                transform: [{ translateY }],
                opacity,
                backgroundColor: styleProps.bg,
                borderColor: styleProps.border,
              },
            ]}
          >
            <Ionicons
              name={styleProps.icon}
              size={20}
              color={styleProps.border}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.text}>{current.message}</Text>

            {/* ✅ Show marketplace item if exists */}
            {current.item && (() => {

              return (
                <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                  <Image
                    source={{ uri: current.item.imageUri ?? "" }}
                    style={{ width: 50, height: 50, borderRadius: 6, marginRight: 8 }}
                  />
                  <View>
                    <Text style={{ fontWeight: "bold" }}>{current.item.item_name}</Text>
                    <Text>₱{Number(current.item.price).toLocaleString()}</Text>
                  </View>
                </View>
              );
            })()}
          </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: SCREEN_WIDTH - 40,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: { fontSize: 16, flex: 1, flexWrap: "wrap" },
});

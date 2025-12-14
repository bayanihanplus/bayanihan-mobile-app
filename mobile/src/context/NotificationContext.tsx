import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, IO_URL } from "../api/api";

export type Notification = {
  id: string;
  userId?: string;
  message: string;
  touserName?: string;
  type: "system" | "friend_request" | "message" | "event" | "market_chat";
  read?: boolean;
  count?: number;
  messages?: { fromUserId: string; fromUserName?: string; toUserId: string; message: string }[];
  item?: { item_name: string; price: number; category: string; imageUri: string };
  timestamp: Date;
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  unreadByType: Record<string, number>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (notification: Notification, showToast?: boolean) => void;
  markAsRead: (userId?: string, type?: string) => void;
  setActiveChat: React.Dispatch<React.SetStateAction<{ userId: string; type: Notification["type"] } | null>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export let socket: Socket;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({});
  const [activeChat, setActiveChat] = useState<{ userId: string; type: Notification["type"] } | null>(null);

  const incrementUnread = (type: string) => {
    setUnreadCount(prev => prev + 1);
    setUnreadByType(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
  };

  const resetUnread = (type?: string) => {
    if (type) setUnreadByType(prev => ({ ...prev, [type]: 0 }));
    else setUnreadByType({});
  };

  const addNotification = (notification: Notification, showToast = true) => {
    setNotifications(prev => {
      const index = prev.findIndex(n => n.userId === notification.userId && n.type === notification.type);

      if (index > -1) {
        const updated = [...prev];
        const existing = updated[index];
        updated[index] = {
          ...existing,
          message: notification.message,
          count: (existing.count || 0) + 1,
          messages: [...(existing.messages || []), ...(notification.messages || [])],
          timestamp: notification.timestamp || new Date(),
          item: notification.item ?? existing.item,
        };
        return updated;
      }

      return [
        {
          ...notification,
          messages: notification.messages || [],
          count: notification.count ?? 1,
          timestamp: notification.timestamp || new Date(),
        },
        ...prev,
      ];
    });

    incrementUnread(notification.type);

    if (showToast) {
      // Show toast only for truly new notifications
      console.log("[Toast] New notification:", notification.message);
      // You can replace console.log with a real toast here
    }
  };

  const markAsRead = (userId?: string, type?: string) => {
    setNotifications(prev =>
      prev.map(n =>
        (userId ? n.userId === userId : true) && (type ? n.type === type : true)
          ? { ...n, count: 0 }
          : n
      )
    );

    if (type) resetUnread(type);
    else setUnreadCount(0);
  };

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!token || !user) return;

        // Connect socket
        socket = io(IO_URL, { query: { token, userId: user.id }, transports: ["websocket"], autoConnect: true });

        socket.on("connect", () => console.log("[socket] connected:", socket.id));
        socket.on("disconnect", reason => console.log("[socket] disconnected:", reason));
        socket.on("connect_error", err => console.error("[socket] connect_error:", err));

        // Listen for friend requests / notifications
        socket.on("notification", (notif: any) => {
          const normalized: Notification = {
            id: notif.id || Date.now().toString(),
            userId: notif.userId,
            message: notif.message,
            type: notif.type,
            timestamp: notif.timestamp ? new Date(notif.timestamp) : new Date(),
          };

          const isScreenActive = window.location.pathname === "/notifications"; // adjust if needed
          addNotification(normalized, !isScreenActive);
          window.dispatchEvent(new CustomEvent("notification:new", { detail: normalized }));
        });

        // Fetch unread notifications without showing toast
        const res = await fetch(`${API_BASE_URL}/chats/unread`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
        });
        const data = await res.json();

        if (data.notifications?.length) {
          data.notifications.forEach((n: any) =>
            addNotification(
              {
                ...n,
                messages: n.messages || [{ fromUserId: n.userId, message: n.message }],
                count: n.count ?? 1,
                timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
              },
              false // do not show toast for fetched notifications
            )
          );
          setUnreadCount(data.notifications.length);
        }
      } catch (err) {
        console.error("[NotifProvider] init error:", err);
      }
    };

    initNotifications();

    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        unreadByType,
        addNotification,
        markAsRead,
        setNotifications,
        setActiveChat,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { socket } from "../context/NotificationContext";
import { useAuthContext } from "../context/AuthContext";

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  timestamp: number;
}

interface ChatProps {
  userId: string; // user to chat with
  username: string; // display name
}

export default function NewChatScreen({ userId, username }: ChatProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Load previous messages from backend if needed (optional)
  useEffect(() => {
    // TODO: fetch chat history API
  }, [userId]);

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (msg: Message) => {
      if (msg.fromUserId === userId || msg.toUserId === userId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket?.on("message", handleMessage);

    return () => {
      socket?.off("message", handleMessage);
    };
  }, [userId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      fromUserId: user?.id?.toString() || "",
      toUserId: userId,
      message: input.trim(),
      timestamp: Date.now(),
    };

    socket?.emit("message", msg);
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.fromUserId === user?.id?.toString()
          ? styles.myMessage
          : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#1F2937",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#374151",
    color: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  messageBubble: {
    maxWidth: "75%",
    marginBottom: 8,
    padding: 8,
    borderRadius: 12,
  },
  myMessage: { backgroundColor: "#2563eb", alignSelf: "flex-end" },
  theirMessage: { backgroundColor: "#374151", alignSelf: "flex-start" },
  messageText: { color: "#F9FAFB" },
  timestamp: { fontSize: 10, color: "#9CA3AF", alignSelf: "flex-end" },
});

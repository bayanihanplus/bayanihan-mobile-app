import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface ChatModalProps {
  visible: boolean;
  seller: string;
  messages: { from: string; text: string }[];
  input: string;
  onClose: () => void;
  onSend: () => void;
  setInput: (text: string) => void;
  currentUser: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  seller,
  messages,
  input,
  onClose,
  onSend,
  setInput,
  currentUser,
}) => {
  const chatScrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Chat with {seller}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.messages}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.bubble,
                  msg.from === currentUser ? styles.myBubble : styles.theirBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.from === currentUser ? styles.myText : styles.theirText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={10}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity style={styles.sendButton} onPress={onSend}>
                <Text style={{ color: "white", fontWeight: "bold" }}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: { fontSize: 16, fontWeight: "bold" },
  closeButton: { fontSize: 18 },
  messages: { paddingHorizontal: 12, marginTop: 8 },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 18,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e6eb",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15 },
  myText: { color: "white" },
  theirText: { color: "black" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 40,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    height: 40,
  },
});

export default ChatModal;

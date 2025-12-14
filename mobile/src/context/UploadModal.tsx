// UploadModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFeed } from "../context/FeedContext";
import { API_BASE_URL, API_BASE_URL_MAIN } from "../config";

export default function UploadModal({
  visible,
  onClose,
  userId,
  username,
  token,
}: {
  visible: boolean;
  onClose: () => void;
  userId: number;
  username: string;
  token: string;
}) {
  const [uploading, setUploading] = useState(false);
  const { addPost, removePlaceholder } = useFeed();

  const handleUpload = async () => {
    try {
      setUploading(true);

      // 1. Pick file
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // 2. Create a temporary optimistic post
      const tempId = `temp-${Date.now()}`;
      const placeholderPost = {
        id: tempId,
        user_id: userId,
        username,
        type: file.type === "video" ? "video" : "image",
        uri: file.uri,
        created_at: new Date().toISOString(),
        caption: "",
        likes: 0,
        isPlaceholder: true,
      };
      addPost(placeholderPost);

      // 3. Build formData and send to server
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType || "image/jpeg",
        name: file.fileName || `upload-${Date.now()}.jpg`,
      } as any);
      formData.append("user_id", userId.toString());
      formData.append("username", username);

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const serverPost = await response.json();
      if (!response.ok) throw new Error(serverPost?.message || "Upload failed");

      // 4. Remove placeholder & add real post
      removePlaceholder(tempId);
      addPost({
        id: serverPost.id,
        user_id: serverPost.user_id,
        username: serverPost.username,
        type: serverPost.type || "image",
        uri: `${API_BASE_URL_MAIN}uploads/${serverPost.user_id}/${
          serverPost.image_url || serverPost.filename
        }`,
        created_at: serverPost.created_at || new Date().toISOString(),
        caption: serverPost.caption || "",
        likes: serverPost.likes || 0,
      });

      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      // Optionally remove placeholder on failure
      // removePlaceholder(tempId);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Upload Post</Text>

          {uploading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleUpload}>
              <Text style={styles.buttonText}>Select & Upload</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  cancel: { marginTop: 10 },
  cancelText: { color: "#555" },
});

import React, { useState, useRef, useEffect,useContext, } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
} from "react-native-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import api, { API_BASE_URL } from "../api/api";
import { FeedContext, Post, } from "../context/FeedContext"; // adjust path

const { height } = Dimensions.get("window");

interface FeedUploadProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: (newPost: any) => void;
  userId: number;
  username: string;
  token: string;
  onReopen?: () => void; // ✅ Add this line
}

const FeedUpload: React.FC<FeedUploadProps> = ({
  visible,
  onClose,
  onUploadComplete,
  userId,
  username,
  token,
  onReopen,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [caption, setCaption] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: "image" | "video";
  } | null>(null);

const { addPost,removePlaceholder  } = useContext(FeedContext);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    if (!visible) {
      setSelectedMedia(null);
      setCaption("");
    }
  }, [visible]);



  // 🔑 Request camera permission (Android)
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera to take photos or videos.",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("Camera permission error:", err);
        return false;
      }
    }
    return true;
  };

  const handlePick = (mediaType: "photo" | "video") => {
    const options: ImageLibraryOptions = { mediaType };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode)
        return Alert.alert("Error", response.errorMessage || "Error selecting media");

      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (!uri) return;
        setSelectedMedia({ uri, type: mediaType === "photo" ? "image" : "video" });
      }
    });
  };

  const handleCamera = async (mediaType: "photo" | "video") => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required to use this feature.");
      return;
    }

  // ✅ Close modal before opening camera (prevents UI conflicts)
  onClose();

    const options: CameraOptions = { mediaType };
    launchCamera(options, (response) => {
      console.log("📸 Camera Response:", response);
      if (response.didCancel) {
        console.log("⚠️ Camera cancelled");
        return;
      }
      if (response.errorCode){
        return Alert.alert("Error", response.errorMessage || "Error capturing media");
      }
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (!uri) return;
        console.log("✅ Camera success! Setting selectedMedia...");
        console.log(token);
        // ✅ Wait a short moment, then re-open modal with preview
      setTimeout(() => {
        setSelectedMedia({ uri, type: mediaType === "photo" ? "image" : "video" });

        // 👇 Re-open modal programmatically
        if (typeof onReopen === "function") onReopen();
      }, 300);
      }
    });
  };

  const handlePost = async () => {
    if (!selectedMedia) return;
    
    // ✅ 1) Show placeholder immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticPost = {
      id: tempId,
      user_id: userId,
      username,
      type: selectedMedia.type,
      uri: selectedMedia.uri,
      caption,
      created_at: new Date().toISOString(),
      likes: 0,
      isPlaceholder: true,
    };
    addPost(optimisticPost);

   try {
    const formData = new FormData();
    formData.append("user_id",userId.toString())
    formData.append("username",username)
    formData.append("caption",caption);
    formData.append("type",selectedMedia.type);

      // Convert URI to file
    const uriParts = selectedMedia.uri.split("/");
    const fileName = uriParts[uriParts.length - 1];
    const fileType = selectedMedia.type === "image" ? "image/jpeg" : "video/mp4";

    // For web: fetch the file or convert URI to blob
  const responses = await fetch(selectedMedia.uri); // uri is usually blob URL
  const blob = await responses.blob();

   // ✅ Append as File object
   formData.append("image", new File([blob], fileName, { type: blob.type }));
   
      const response = await axios.post(
          `${API_BASE_URL}/posts`,formData,{
         headers: {
            Authorization: `Bearer ${token}`, // ✅ attach token 
            "Content-Type": "multipart/form-data",
          }
       }
      );
      console.log("✅ Upload successful", response.data);

     // ✅ Add the new post directly to the Feed context
        const newPost: Post = {
          id: response.data.id, // or Date.now() if backend doesn't return id
          user_id: response.data.user_id,
          username: response.data.username,
          uri: response.data.fileUrl || response.data.filename,
          type: response.data.type,
          caption: response.data.caption,
          created_at: response.data.created_at || new Date().toISOString(),
          likes: 0,
        };
        // ✅ 3) Replace placeholder with real post
        removePlaceholder(tempId);

        addPost(newPost); // ← feed updates immediately 

      // Notify parent
    onUploadComplete(response.data);
    onClose();
    } catch (error) {
     console.error("❌ Upload error", error);
     Alert.alert("Upload failed", "Please try again.");
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />

        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          {!selectedMedia ? (
            <>
              <Text style={styles.title}>Shout It Out 📢</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleCamera("photo")}
                >
                  <MaterialIcons name="photo-camera" size={32} color="#fff" />
                  <Text style={styles.iconLabel}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handlePick("photo")}
                >
                  <MaterialIcons name="image" size={32} color="#fff" />
                  <Text style={styles.iconLabel}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handlePick("video")}
                >
                  <MaterialIcons name="videocam" size={32} color="#fff" />
                  <Text style={styles.iconLabel}>Video</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ScrollView style={{ width: "100%" }}>
              <Text style={styles.title}>Preview & Caption</Text>
              <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />

              <TextInput
                style={styles.captionInput}
                placeholder="Write a caption..."
                placeholderTextColor="#aaa"
                value={caption}
                onChangeText={setCaption}
                multiline
              />

              <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Text style={styles.postText}>Post</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#1c1c1c",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    maxHeight: height * 0.9,
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
  },
  iconLabel: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },
  captionInput: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  postText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    width: "100%",
    padding: 14,
    backgroundColor: "#333",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default FeedUpload;

import React, { useState, useRef,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { fetchEvents } from "../api/eventApi";
import { API_BASE_URL_MAIN } from "../api/api";
import { createEvent } from "../api/eventApi"; // adjust path
import Toast from "react-native-toast-message";

type EventType = {
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  bannerUri: string;
  category: string;
};

type Comment = { user: string; text: string; reactions?: Record<string, number> };

export default function EventFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [formData, setFormData] = useState<EventType>({
    title: "",
    description: "",
    date: new Date(),
    time: new Date(),
    location: "",
    bannerUri: "",
    category: "Entertainment",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const categories = ["Entertainment", "Sports", "Faith", "Learning", "Community"];
  
  const openModal = () => {
    setIsModalOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsModalOpen(false));
  };

  const handlePickBanner = async () => {
    
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    setFormData((prev) => ({
      ...prev,
      bannerUri: result.assets[0].uri, // ✅ store only the uri
    }));
  }
};
  const handlePublish = async () => {
  if (!formData.title.trim()) {
    return Toast.show({
      type: "error",
      text1: "Event Error",
      text2: "Please enter a title before publishing.",
      visibilityTime: 3000,
    });
  }

  try {
    const form = new FormData();

    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("date", formData.date.toISOString().split("T")[0]); 
    form.append("time", formData.time.toTimeString().split(" ")[0]); 
    form.append("location", formData.location);
    form.append("category", formData.category);

    if (formData.bannerUri) {
      const response = await fetch(formData.bannerUri);
      const blob = await response.blob();

      const fileName = "banner.jpg"; // ✅ You can generate a unique name here
      form.append("banneruri", blob, fileName);
    }

    // Debug all form entries
    form.forEach((value, key) => console.log(`📦 FormData → ${key}:`, value));

    // 🔥 Send request AFTER building form
    const res = await createEvent(form);
    console.log("✅ Server response:", res.data);

    Toast.show({
      type: "success",
      text1: "Event Published 🎉",
      text2: res.message || `${formData.title} has been created successfully.`,
      visibilityTime: 3000,
    });

     if (res.event) {
          const newEvent = {
            ...res.event,
            bannerUri: res.event.banneruri
              ? `${API_BASE_URL_MAIN}${res.event.banneruri.replace(/\\/g, "/")}`
              : null,
            date: new Date(res.event.date),
            time: new Date(`1970-01-01T${res.event.time}`),
          };
          console.log("Fetches: =>",newEvent);  
          setEvents([newEvent, ...events]); // ✅ Safe to render
        }

    // ✅ Reset form after success
    setFormData({
      title: "",
      description: "",
      date: new Date(),
      time: new Date(),
      location: "",
      bannerUri: "",
      category: "Entertainment",
    });

    closeModal();

  } catch (error: any) {
    console.error("❌ Failed to create event:", error.response?.data || error.message);

    Toast.show({
      type: "error",
      text1: "Event Error",
      text2: error.response?.data?.message || "Failed to publish event. Please try again.",
      visibilityTime: 3000,
    });
  }
};


  //--Fetch to Database
  useEffect(() => {
  const loadEvents = async () => {
    try {
      const res = await fetchEvents();
      const formattedEvents = res.data.events.map((e: any) => ({
        ...e,
        bannerUri : e.banneruri ? `${API_BASE_URL_MAIN}${e.banneruri.replace(/\\/g, "/")}` : null,
        date: new Date(e.date),
        time: new Date(`1970-01-01T${e.time}`),
      }));
      setEvents(formattedEvents);
     // console.log(formattedEvents);
    } catch (err) {
      console.error(err);
    }
  };
  loadEvents();
}, []);
  
  // --- Event Card Component ---
        const EventCard = ({ event }: { event: EventType }) => {
                // --- State ---
                const [reactionsCount, setReactionsCount] = useState<Record<string, number>>({
                  "👍": 0,
                  "❤️": 0,
                  "🫂": 0,
                  "🙏": 0,
                  "💪": 0,
                });

                const [comments, setComments] = useState<Comment[]>([]);
                const [newComment, setNewComment] = useState("");
                const [showAllComments, setShowAllComments] = useState(false);

                const reactions = ["👍", "❤️", "🫂", "🙏", "💪"];
                const commentReactions = ["👍", "❤️", "🙏"];

                // --- Handlers ---
                const handleReaction = (r: string) =>
                  setReactionsCount((prev) => ({ ...prev, [r]: (prev[r] || 0) + 1 }));

                const handleAddComment = () => {
                  if (!newComment.trim()) return;
                  setComments([...comments, { user: "You", text: newComment }]);
                  setNewComment("");
                };

                // --- JSX ---
                return (
                  <View style={styles.cardContainer}>
               
                    {/* --- Banner --- */}
                    {event.bannerUri ? (
                      <Image source={{ uri: event.bannerUri }} style={styles.bannerImage} />
                    ) : (
                      <View style={styles.bannerPlaceholder}>
                        <Text>No Banner</Text>
                      </View>
                    )}

                    {/* --- Event Info --- */}
                    <View style={styles.eventInfo}>
                      <Text style={styles.title}>{event.title}</Text>
                      <Text style={styles.description}>{event.description}</Text>
                      <Text style={styles.category}>Category: {event.category}</Text>
                      <Text style={styles.date}>{event.date.toDateString()}</Text>
                      <Text style={styles.time}>{event.time.toLocaleTimeString()}</Text>
                      <Text style={styles.location}>Location: {event.location}</Text>
                    </View>

                    {/* --- Reactions --- */}
                    <View style={styles.reactions}>
                      {reactions.map((r) => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => handleReaction(r)}
                          activeOpacity={0.7}
                          style={{ padding: 8, borderRadius: 8, backgroundColor: "#E5E7EB", marginHorizontal: 4 }}
                        >
                          <Text style={{ fontSize: 24 }}>{r} {reactionsCount[r]}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* --- Comments Section --- */}
                    <View style={styles.commentsContainer}>
                      
                      {/* Add Comment */}
                      <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                      />
                      <TouchableOpacity style={styles.publishButton} onPress={handleAddComment}>
                        <Text style={{ color: "white" }}>Comment</Text>
                      </TouchableOpacity>

                      {/* Comment Threads */}
                      <ScrollView style={styles.commentThreads}>
                        {(showAllComments ? comments : comments.slice(0, 2)).map((c, idx) => (
                          <View key={idx} style={styles.commentContainer}>
                            <Text style={styles.commentUser}>{c.user}</Text>
                            <Text>{c.text}</Text>

                            <View style={{ flexDirection: "row", marginTop: 4 }}>
                              {commentReactions.map((r) => (
                                <TouchableOpacity
                                  key={r}
                                  style={{ marginRight: 8 }}
                                  onPress={() => {
                                    const newComments = [...comments];
                                    newComments[idx].reactions = newComments[idx].reactions || {};
                                    newComments[idx].reactions![r] =
                                      (newComments[idx].reactions![r] || 0) + 1;
                                    setComments(newComments);
                                  }}
                                >
                                  <Text>{r} {c.reactions?.[r] || 0}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        ))}

                        {/* Show All / Show Less */}
                        {comments.length > 2 && (
                          <TouchableOpacity onPress={() => setShowAllComments(!showAllComments)}>
                            <Text style={{ color: "#2563EB", marginTop: 5 }}>
                              {showAllComments ? "Show Less" : `View All ${comments.length} Comments`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                );
              };



  return (
    <View style={{ flex: 1 }}>
      
      <TouchableOpacity style={styles.floatingButton} onPress={openModal}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

     
        {isModalOpen && (
                <Modal transparent visible={isModalOpen} animationType="none" onRequestClose={closeModal}>
                      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
                          <View> 
                            <Text style={styles.modalTitle}>Create Event</Text>

                            <TextInput
                              style={styles.input}
                              placeholder="Title"
                              value={formData.title}
                              onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />

                            <TextInput
                              style={[styles.input, { height: 80 }]}
                              placeholder="Description"
                              multiline
                              value={formData.description}
                              onChangeText={(text) => setFormData({ ...formData, description: text })}
                            />

                            <Text style={{ marginBottom: 5 }}>Category:</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
                              {categories.map((c) => (
                                <TouchableOpacity
                                  key={c}
                                  onPress={() => setFormData({ ...formData, category: c })}
                                >
                                  <View style={[styles.categoryButton, formData.category === c && styles.categorySelected]}>
                                    <Text style={{ color: formData.category === c ? "white" : "black" }}>{c}</Text>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </View>

                          
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                              <View style={[styles.input, { justifyContent: "center" }]}>
                                <Text>{formData.date.toDateString()}</Text>
                              </View>
                            </TouchableOpacity>

                           
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                              <View style={[styles.input, { justifyContent: "center" }]}>
                                <Text>{formData.time.toLocaleTimeString()}</Text>
                              </View>
                            </TouchableOpacity>

                            <TextInput
                              style={styles.input}
                              placeholder="Location"
                              value={formData.location}
                              onChangeText={(text) => setFormData({ ...formData, location: text })}
                            />

                           
                            <TouchableOpacity onPress={handlePickBanner}>
                              <View style={styles.bannerButton}>
                                <Text style={{ color: "white" }}>
                                  {formData.bannerUri ? "Change Banner" : "Upload Banner"}
                                </Text>
                              </View>
                            </TouchableOpacity>
                            {formData.bannerUri ? <Image source={{ uri: formData.bannerUri }} style={styles.bannerPreview} /> : null}

                         
                            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                              <TouchableOpacity onPress={handlePublish} >
                                <View style={[styles.publishButton, { marginRight: 10 }]}>
                                  <Text style={{ color: "white" }}>Publish</Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={closeModal}>
                                <View style={styles.cancelButton}>
                                  <Text>Cancel</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Animated.View>
                      </KeyboardAvoidingView>
                    </Modal>
              )}


      
      <ScrollView style={{ marginTop: 10, paddingHorizontal: 10 }}>
              {events.map((event,idx) => {
                return <EventCard key={idx} event={event} />;
              })}
              
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    backgroundColor: "#1D4ED8",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 5,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
    marginTop: "auto",
    marginBottom: "auto", // centers vertically
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  categorySelected: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  bannerButton: { backgroundColor: "#2563EB", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  bannerPreview: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  cancelButton: { padding: 10, borderRadius: 8, backgroundColor: "#E5E7EB" },
  publishButton: { padding: 10, borderRadius: 8, backgroundColor: "#10B981" },
  cardContainer: { backgroundColor: "white", borderRadius: 10, marginBottom: 15, overflow: "hidden", elevation: 3 },
  bannerImage: { width: "100%", height: 200, resizeMode: "cover" },
  bannerPlaceholder: { height: 200, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
  eventInfo: { padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  description: { fontSize: 16, marginBottom: 5, color: "#6B7280" },
  category: { fontSize: 14, color: "#9CA3AF", marginBottom: 5 },
  date: { fontSize: 14, color: "#9CA3AF", marginBottom: 5 },
  time: { fontSize: 14, color: "#9CA3AF", marginBottom: 5 },
  location: { fontSize: 14, color: "#9CA3AF", marginBottom: 15 },
  reactions: { flexDirection: "row", justifyContent: "space-around", paddingBottom: 10, marginBottom: 10 },
  commentsContainer: { padding: 15, backgroundColor: "#F9FAFB" },
  commentThreads: { maxHeight: 200, marginTop: 10 },
  commentContainer: { paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  commentUser: { fontWeight: "bold" },
});

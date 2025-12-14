import React, { useRef, useState,useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Pressable,
  Easing,
  ActivityIndicator
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import MarketplaceScreen from "./MarketplaceScreen";
import Events from "./EventsScreen";
import OnboardingHubScreen from "./OnboardingHubScreen"
import FriendScreen from "./FriendScreen";
import  NotificationsScreen  from "./NotificationsScreen";
import MenuScreen from "./MenuScreen";
import FeedUpload from "./FeedUpload";
import { useAuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { ProtectedRoute } from "../context/ProtectedRoute";
import StepRestoreLoader from "../components/StepRestoreLoader";
import AddItemModal from "../context/Additem";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const samplePosts = [
  {
    id: 1,
    type: "image",
    header: "Venice, Italy",
    description: "A stunning view of Venice’s iconic canals with historic buildings and calm waters.",
    uri: "https://images.pexels.com/photos/258196/pexels-photo-258196.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
  },
  {
    id: 2,
    type: "video",
    header: "TikTok Style Video",
    description: "A short, fun clip styled like a TikTok video.",
    uri: "https://www.pexels.com/download/video/2795752/"
  },
  {
    id: 3,
    type: "image",
    header: "Another Post",
    description: "Captured moment of calm scenery, showcasing natural beauty.",
    uri: "https://images.pexels.com/photos/6348018/pexels-photo-6348018.jpeg?cs=srgb&dl=pexels-quang-nguyen-vinh-222549-6348018.jpg&fm=jpg"
  },
  {
    id: 4,
    type: "video",
    header: "Another Video",
    description: "A simple sample video for testing playback features.",
    uri: "https://www.pexels.com/download/video/3197604/"
  },
];

export default function SocialFeedScreen() {
  const { token, user } = useAuthContext();
  const navigation = useNavigation() as any;
  const [posts, setPosts] = useState(samplePosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"Feed" | "Marketplace" | "Events" | "Coop" | "Government" | "Friends" | "Notifications" | "Post" | "Menu">("Feed");
  const videoRefs = useRef<(Video | null)[]>([]);
  const heartAnim = useRef(new Animated.Value(0)).current;
  const [loadingTab, setLoadingTab] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animated top/bottom bars
  const topBarTranslateY = useRef(new Animated.Value(0)).current;
  const bottomTabTranslateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  // Animated button addpost
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const addPostTranslateY = useRef(new Animated.Value(0)).current; 
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
    });
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (!viewableItems.length) return;
    const index = viewableItems[0].index;
    setCurrentIndex(index);
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index && posts[i].type === "video") video.playAsync();
      else if (posts[i].type === "video") video.pauseAsync();
    });
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const toggleLike = (index: number) => {
    setLikedPosts((prev) => ({ ...prev, [index]: !prev[index] }));
    setLikes((prev) => ({
      ...prev,
      [index]: prev[index] + (likedPosts[index] ? -1 : 1) || 1,
    }));
  };
  
  const handleDoubleTap = (index: number) => {
    toggleLike(index);
    heartAnim.setValue(0);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.5, friction: 3, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };
    // Start pulse animation button
    useEffect(() => {
        // Continuous rotation
       const rotateLoop = () => {
        Animated.sequence([
            Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.linear,
            }),
            Animated.delay(5000), // wait 5 seconds
            Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 0, // reset rotation instantly
            useNativeDriver: true,
            }),
        ]).start(() => rotateLoop());
        };

        rotateLoop();
        // Pulsing effect
        Animated.loop(
            Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start(); 
      }, []);
          const handleScroll = ({ nativeEvent }: any) => {
          const currentOffset = nativeEvent.contentOffset.y;
          const direction = currentOffset > lastOffset.current ? "down" : "up";
          lastOffset.current = currentOffset;

          const hide = direction === "down";

          // Animate top bar
          Animated.timing(topBarTranslateY, {
              toValue: hide ? -120 : 0,
              duration: 250,
              useNativeDriver: true,
          }).start();

          // Animate bottom tab
          Animated.timing(bottomTabTranslateY, {
              toValue: hide ? 100 : 0,
              duration: 250,
              useNativeDriver: true,
          }).start();

          // Animate Add Post button
          Animated.timing(addPostTranslateY, {
              toValue: hide ? 100 : 0,  // same as bottom tab
              duration: 250,
              useNativeDriver: true,
          }).start();
        };
  // Render placeholder screens for Marketplace, Events, Coop
  const renderTabContent = () => {

    if (loadingTab) {
        return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
        );
    }

    switch (activeTab) {
      case "Feed":
        return (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const postHeight = SCREEN_HEIGHT - 60 - 40; // top menu + bottom tab
              return (
                <Pressable onPress={() => handleDoubleTap(index)}>
                  <View style={{ width: SCREEN_WIDTH, height: postHeight }}>
                    {item.type === "video" ? (
                      <Video
                        ref={(ref) => (videoRefs.current[index] = ref)}
                        source={{ uri: item.uri }}
                        style={styles.media}
                        resizeMode="cover"
                        isLooping
                        shouldPlay={index === currentIndex}
                      />
                    ) : (
                      <Image source={{ uri: item.uri }} style={styles.media} />
                    )}

                    <Animated.Text
                      style={[styles.doubleTapHeart, { transform: [{ scale: heartAnim }] }]}
                    >
                      ❤️
                    </Animated.Text>

                    {/* Overlay Text */}
                    <View style={styles.overlay}>
                      <View style={styles.textContainer}>
                        {item.header && <Text style={styles.header}>{item.header}</Text>}
                        {item.description && <Text style={styles.description}>{item.description}</Text>}
                      </View>
                    </View>

                    {/* Floating Right Vertical Bar */}
                    <View style={styles.floatingRightBar}>
                      <Image
                        source={{ uri: "https://picsum.photos/48" }}
                        style={styles.profileFloating}
                      />
                      <TouchableOpacity onPress={() => toggleLike(index)} style={styles.iconBtn}>
                        <Ionicons
                          name="heart"
                          size={25}
                          color={likedPosts[index] ? "red" : "#fff"}
                        />
                        <Text style={styles.iconText}>{likes[index] || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="chatbubble-outline" size={25} color="#fff" />
                        <Text style={styles.iconText}>0</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="share-social-outline" size={25} color="#fff" />
                        <Text style={styles.iconText}>0</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="swap-horizontal-outline" size={25} color="#fff" />
                        <Text style={styles.iconText}>0</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        );
      case "Marketplace":
        return <MarketplaceScreen />; 
      case "Events":
        return <Events />;
      case "Coop":
        return <StepRestoreLoader />;
      case "Government":
        return <OnboardingHubScreen />;
      case "Friends":
        return <FriendScreen />;
      case "Notifications":
        return <NotificationsScreen />;
      case "Menu":
        return <MenuScreen />;
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{activeTab} Screen</Text>
          </View>
        );
    }
  };

  return (
   <ProtectedRoute>
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Top Bar + Animated Tabs */}
      <Animated.View
        style={{
          transform: [{ translateY: topBarTranslateY }],
          zIndex: 10,
          backgroundColor: "#111827",
        }}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Ionicons name="search-outline" size={20} color="#343434ff" />
          <Image
            source={require("../../assets/bayanihanLogo.png")} // app logo
            style={styles.logoTop}
          />
          <Image source={{ uri: "https://picsum.photos/32" }} style={styles.profile} />
        </View>

        {/* Animated Tabs */}
        <View style={styles.topMenu}>
          {[
            { name: "Feed", icon: "home-outline" },
            { name: "Marketplace", icon: "pricetag-outline" },
            { name: "Events", icon: "calendar-outline" },
            { name: "Coop", icon: "people-outline" },
          ].map((tab) => (
            <TouchableOpacity
                    key={tab.name}
                    style={styles.tabButton}
                    onPress={() => {
                        if (tab.name === activeTab) return; // already active
                        setLoadingTab(true);
                        setTimeout(() => {
                        setActiveTab(tab.name as any);
                        setLoadingTab(false);
                        }, 800); // 0.8s loading, adjust as needed
                    }}
                    >
                    <Ionicons
                      name={tab?.icon as any}
                      size={16}
                      color={activeTab === tab.name ? "#2563eb" : "#000"}
                    />
                    <Text
                        style={[
                          styles.tabText,
                          activeTab === tab.name && { color: "#2563eb" },
                          { color: activeTab === tab.name ? "#2563eb" : "#000" }
                        ]}
                      >
                        {tab.name}
                      </Text>
                    </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Feed or Placeholder */}
      <View style={{ flex: 1 }}>{renderTabContent()}</View>

      {/* Add Post Button */}
        <Animated.View
        style={[styles.bottomTab, { transform: [{ translateY: bottomTabTranslateY }] }]}
        >
        {[
            { name: "Friends", icon: "people-outline" },
            { name: "Notifications", icon: "notifications-outline" },
            { name: "Post", icon: "add-circle" },,
            { name: "Government", icon: "logo-windows" },
            { name: "Menu", icon: "menu-outline" },
        ].map((tab) => (
            <TouchableOpacity
                    key={tab?.name}
                    onPress={() => {
                        if (tab?.name === "Post") {
                         // Open modal depending on active tab
                          if (["Marketplace", "Events", "Coop"].includes(activeTab)) {
                            setIsModalVisible(true);
                          }
                          return;
                        }

                        // Normal tab switching
                        if (tab?.name === activeTab) return;
                        setLoadingTab(true);
                        setTimeout(() => {
                          setActiveTab(tab?.name as any);
                          setLoadingTab(false);
                        }, 300);
                      }}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: tab?.name === "Post" ? -50 : 0, // lift up
                    }}
                  >
                    <View
                      style={
                        tab?.name === "Post"
                          ? {
                              backgroundColor: activeTab === "Post" ? "#2563eb" : "#fff",
                              padding: 10,
                              borderRadius: 50,
                              elevation: 5, // Android shadow
                            }
                          : {}
                      }
                    >
                      <Ionicons
                          name={tab?.icon as any}
                          size={tab?.name === "Post" ? 40 : 20} // only Post is 30
                          color={
                            tab?.name === "Post"
                              ? activeTab === "Post"
                                ? "#fff"
                                : "#000"
                              : activeTab === tab?.name
                              ? "#2563eb"
                              : "#000"
                          }
                        />
                    </View>

                    {/* Label */}
                    <Text
                      style={{
                        color: activeTab === tab?.name ? "#2563eb" : "#000",
                        fontSize: 10,
                        marginTop: tab?.name === "Post" ? 4 : 2,
                      }}
                    >
                      {tab?.name}
                    </Text>
                  </TouchableOpacity>
        ))}
        </Animated.View>
         {/* ===== HERE: Add modals ===== */}
          {activeTab === "Marketplace" && (
            <AddItemModal
              visible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              onSubmit={(item) => {
                handleAddItem(item);
                setIsModalVisible(false);
              }}
            />
          )}
          {activeTab === "Feed" && (
              <FeedUpload
              visible={uploadVisible}
              onClose={() => setUploadVisible(false)}
              onReopen={() => setUploadVisible(true)}
              userId={parseInt(user?.id)}
              token={token}
              username={user?.username}
              onUploadComplete={(newPost) =>
                navigation.navigate("Social", { newPost })
              }
            />
          )}
    </View>
  </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 60,
    backgroundColor: "#EFEFEF",
  },
  logoTop: { width: 180, height: 40, resizeMode: "contain" },
  profile: { width: 32, height: 32, borderRadius: 16 },

  topMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#F5F5F5", // dirty white
  },

  tabButton: { alignItems: "center" },

  tabText: { 
    color: "#1F2937",
    fontSize: 12,
    marginTop: 2,
  },

  menuText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },

  menuTextActive: {
    color: "#2563EB",
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    paddingBottom: 2,
  },

  bottomTab: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",     // white
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",      // light grey line
    zIndex: 10,
  },

  media: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 60 - 40 },

  overlay: {
    position: "absolute",
    bottom: 90,
    left: 10,
    right: 50,
    zIndex: 10,
  },
  textContainer: {
  backgroundColor: "rgba(0,0,0,0.4)", // semi-transparent background
  padding: 10,
  borderRadius: 8,
  },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
  },

  text: { 
    color: "#ffffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  doubleTapHeart: {
    position: "absolute",
    top: "45%",
    left: "45%",
    fontSize: 80,
    color: "white",
    opacity: 0.8,
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "600",
  },

  floatingRightBar: {
    position: "absolute",
    right: 12,
    top: SCREEN_HEIGHT / 2.2,
    alignItems: "center",
  },

  profileFloating: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },

  iconBtn: {
    alignItems: "center",
    marginBottom: 20,
  },

  iconText: {
    color: "#FFFFFF", // keep white (videos are dark)
    fontSize: 12,
    marginTop: 4,
  },

  addPostButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 20,
  },
});


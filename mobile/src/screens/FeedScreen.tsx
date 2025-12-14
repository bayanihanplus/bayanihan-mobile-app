import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FlatList,
  View,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL, API_BASE_URL_MAIN } from "../api/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type FeedScreenProps = {
  scrollY: Animated.Value;
  onScrollDirectionChange?: (direction: "up" | "down") => void;
  immersive?: boolean;
};

const FeedScreen = forwardRef(
  ({ scrollY, onScrollDirectionChange, immersive }: FeedScreenProps, ref) => {
    const lastOffset = useRef(0);
    const [posts, setPosts] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState<{ [key: number]: number }>({});
    const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
    const heartAnim = useRef(new Animated.Value(0)).current;
    const videoRefs = useRef<(Video | null)[]>([]);

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/posts`);
        const data = await res.json();
        const postsWithType = data.map((p: any) => ({
          ...p,
          type: p.type || "video",
          uri: `${API_BASE_URL_MAIN}uploads/${p.user_id}/${p.image_url}`,
        }));
        setPosts(postsWithType);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchPosts,
    }));

    useEffect(() => {
      fetchPosts();
    }, []);

    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: false,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const currentOffset = e.nativeEvent.contentOffset.y;
          const direction = currentOffset > lastOffset.current ? "down" : "up";
          if (onScrollDirectionChange) {
            onScrollDirectionChange(direction);
          }
          lastOffset.current = currentOffset;
        },
      }
    );

    const onViewRef = useRef(({ viewableItems }: any) => {
      if (viewableItems.length === 0) return;
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      videoRefs.current.forEach((video, i) => {
        if (!video) return;
        if (i === index) video.playAsync();
        else video.pauseAsync();
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
        Animated.spring(heartAnim, {
          toValue: 1.5,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    // Dynamic height: adjust for immersive mode
    const mediaHeight = immersive ? SCREEN_HEIGHT : SCREEN_HEIGHT;

    return (
      <SafeAreaProvider>
        <Animated.FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          initialNumToRender={5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            if (!item) return null;

            const scaleAnim = scrollY.interpolate({
              inputRange: [
                (index - 1) * mediaHeight,
                index * mediaHeight,
                (index + 1) * mediaHeight,
              ],
              outputRange: [0.95, 1, 0.95],
              extrapolate: "clamp",
            });

            return (
              <TouchableWithoutFeedback onPress={() => handleDoubleTap(index)}>
                <Animated.View
                  style={[
                    styles.feedItem,
                    {
                      transform: [{ scale: scaleAnim }],
                      height: mediaHeight,
                    },
                  ]}
                >
                  <View style={{ width: SCREEN_WIDTH, height: mediaHeight, overflow: "hidden" }}>
                    {item.type === "video" ? (
                      <Video
                        ref={(ref: Video | null) => (videoRefs.current[index] = ref)}
                        source={{ uri: item.uri }}
                        style={[styles.media, { height: mediaHeight }]}
                        resizeMode="cover"
                        shouldPlay={index === currentIndex}
                        isLooping
                        useNativeControls={false}
                        isMuted={false}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.uri }}
                        style={[styles.media, { height: mediaHeight }]}
                        resizeMode="cover"
                      />
                    )}
                  </View>

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={styles.overlayGradient}
                  />

                  <Animated.View style={styles.verticalButtonContainer}>
                    <TouchableOpacity style={styles.verticalButton}>
                      <Image
                        source={{ uri: item.userAvatar }}
                        style={styles.profileIcon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleLike(index)}
                      style={styles.verticalButton}
                    >
                      <Text
                        style={[
                          styles.emojiButton,
                          likedPosts[index] && { color: "red" },
                        ]}
                      >
                        ❤️
                      </Text>
                      <Text style={styles.buttonCount}>{likes[index] || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.verticalButton}>
                      <Text style={styles.emojiButton}>💬</Text>
                      <Text style={styles.buttonCount}>{item.commentCount || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.verticalButton}>
                      <Text style={styles.emojiButton}>🔗</Text>
                      <Text style={styles.buttonCount}>Share</Text>
                    </TouchableOpacity>
                  </Animated.View>

                  {item.caption && (
                    <Animated.View style={styles.captionContainer}>
                      <Text style={styles.captionText}>{item.caption}</Text>
                    </Animated.View>
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          }}
        />
      </SafeAreaProvider>
    );
  }
);

export default FeedScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  feedItem: {
    width: SCREEN_WIDTH,
    justifyContent: "flex-end",
  },
  media: {
    width: SCREEN_WIDTH,
    position: "absolute",
    top: 0,
    left: 0,
    resizeMode: "cover",
  },
  overlayGradient: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 120,
  },
  verticalButtonContainer: {
    position: "absolute",
    right: 10,
    bottom: 80,
    justifyContent: "space-between",
    alignItems: "center",
  },
  verticalButton: {
    marginBottom: 20,
    alignItems: "center",
  },
  emojiButton: {
    fontSize: 36,
    color: "white",
  },
  buttonCount: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 10,
  },
  captionContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 70,
  },
  captionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

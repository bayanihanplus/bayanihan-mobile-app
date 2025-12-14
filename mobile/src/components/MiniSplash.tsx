// components/MiniSplash.tsx
import React, { useEffect, useRef } from "react";
import { Animated, View, Image, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface MiniSplashProps {
  duration?: number; // in ms
  onFinish?: () => void;
  logo?: any;
  visible?: boolean;
}

export default function MiniSplash({visible = false, duration = 800, onFinish, logo }: MiniSplashProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (!visible) return; // do nothing if hidden
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: true,
      }).start(() => onFinish && onFinish());
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={logo || require("../../assets/bayanihanLogo.png")} style={styles.logo} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width,
    height,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
  },
});

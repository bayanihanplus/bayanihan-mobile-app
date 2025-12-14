import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions, Animated } from "react-native";
import { Linking } from "react-native";

const {width , height} = Dimensions.get("window");

const SplashScreen = ({ navigation }: any) => {

  const fadeAnim = useRef(new Animated.Value(1)).current;
    // inside useEffect
   useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl?.startsWith("bayanihanapp://reset-password/")) {
        const token = initialUrl.split("/").pop();
        navigation.replace("ResetPassword", { token });
        return;
      }

      // normal splash flow
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace("Social");
      });
    };

    const timer = setTimeout(() => handleDeepLink(), 500); // slight delay to catch deep link
    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <Animated.View style={styles.container}>
      <Image
        source={require("../../assets/bayanihanLogo.png")} // 👈 Your app logo
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#0084ff" style={{ marginTop: 20 }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 400,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0084ff",
  },
});

export default SplashScreen;

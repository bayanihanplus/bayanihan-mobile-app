import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuthContext } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { FeedProvider } from "./src/context/FeedContext";
import { NotificationToast } from "./src/components/NotificationToast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";


const linking = {
  prefixes: ["bayanihanapp://"],
  config: {
    screens: {
      Login: "login",
      ResetPassword: "reset-password/:token",
    },
  },
};

export default function App() {

useEffect(() => {
  if (typeof Notification !== "undefined") {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("🔔 Notification permission:", perm);
      });
    }
  } else {
    console.log("Notifications are not available in this environment.");
  }
}, []);
  return (
    <AuthProvider>
      <NotificationProvider>
        <FeedProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer linking={linking}>
              <AppNavigator />
              <NotificationToast /> 
            </NavigationContainer>
          </GestureHandlerRootView>
          <Toast />
        </FeedProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

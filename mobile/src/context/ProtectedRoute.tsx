// ProtectedRoute.tsx
import React, { ReactNode, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuthContext();
  const navigation = useNavigation();
    
  useEffect(() => {
    if (!loading && !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" as never }],
      });
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <>{children}</>;
};

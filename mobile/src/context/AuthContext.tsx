// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api"; // ✅ you already have this for login requests

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token & user on app start
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (newToken: string, newUser: any) => {
    await AsyncStorage.setItem("token", newToken);
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  /**
   * 🔄 Refreshes the token using your backend refresh endpoint.
   * Returns the new token or null if refresh fails.
   */
  const refreshToken = async (): Promise<string | null> => {
        try {
          if (!token) return null;

          console.log("🔄 Requesting new token...");
          const response = await api.post(
            "/auth/refresh",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const newToken = response.data.token;
          console.log("✅ Got new token:", newToken);

          await AsyncStorage.setItem("token", newToken);
          setToken(newToken);

          return newToken;
        } catch (error: any) {
          console.error("❌ Failed to refresh token:", error.response?.data || error.message);
          await logout();
          return null;
        }
      };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshToken, // ✅ expose refresh function
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
  return context;
};

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Replace with your backend URL (make sure IP is reachable by device/emulator)
export const API_BASE_URL = "https://bayanihanplus.com/api";
export const API_BASE_URL_MAIN = "https://bayanihanplus.com/";
export const IO_URL = "https://bayanihanplus.com:5001";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 1) Attach JWT automatically before every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 2) Handle expired token and refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          // Refresh token
          const res = await api.post("/auth/refresh", { refreshToken });
          const { token: newToken } = res.data;

          // Store new token
          await AsyncStorage.setItem("token", newToken);

          // Retry original request with new token
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          return api(error.config);
        } catch {
          // Refresh failed → logout user
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("refreshToken");
          // Optional: navigate to login screen
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

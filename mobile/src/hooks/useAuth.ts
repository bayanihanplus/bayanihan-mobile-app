import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  username: string;
  email?: string;
  profile_Picture?: string;
}

export default function useAuth(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // ✅ added user state

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user"); // get user from storage
       
        if (!storedToken || !storedUser) {
          navigation.replace("Login");
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser)); // parse and set user
        }
      } catch (err) {
        console.error(err);
        navigation.replace("Login");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [navigation]);

  return { loading, token ,user,setUser};
}

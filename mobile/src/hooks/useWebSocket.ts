// useWebSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "../context/AuthContext";

let socket: Socket | null = null;

export function useSocket(url: string = "https://bayanihanplus.com") {
  const { user } = useAuthContext();

  useEffect(() => {
    if (!socket && user) {
      socket = io(url, { transports: ["websocket"] });

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
        socket?.emit("user:online", user.id); // tell server we’re online
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, url]);

  return socket;
}

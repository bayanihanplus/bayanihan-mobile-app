"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// testSocket.ts
const socket_io_client_1 = require("socket.io-client");
const SERVER_URL = "http://192.168.1.44:5001"; // ✅ your Socket.IO server
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJuZXdAZ21haWwuY29tIiwiaWF0IjoxNzU3NzI1NTExLCJleHAiOjE3NTgzMzAzMTF9.9Zpzs5Ann9ispodeAkkDLgzpqiJpxO_Wskxw1RN2NIU";
const USER_ID = "4"; // sender userId
const socket = (0, socket_io_client_1.io)(SERVER_URL, {
    query: { token: TOKEN, userId: USER_ID },
    transports: ["websocket"],
});
socket.on("connect", () => {
    console.log("✅ Connected to server with socket id:", socket.id);
    const testMessage = {
        fromUserId: USER_ID,
        fromUserName: "TestUser2",
        toUserId: "1", // ✅ Send to user with id 1
        message: "Hello from Node + TypeScript test! 🚀",
        type: "market_chat",
    };
    // ✅ Use correct event name
    socket.emit("send_message", testMessage);
    console.log("📩 Message sent:", testMessage);
});
// ✅ Listen for messages (to confirm delivery)
socket.on("message", (msg) => {
    console.log("📨 Message received:", msg);
});
socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
});
socket.on("connect_error", (err) => {
    console.error("⚠️ Connection error:", err.message);
});

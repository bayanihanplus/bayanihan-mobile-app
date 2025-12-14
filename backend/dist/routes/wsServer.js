"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const wss = new ws_1.WebSocketServer({ port: 5001 });
wss.on("connection", (ws, req) => {
    console.log("🔌 WS client connected attempt:", req.url);
    try {
        const url = new URL(req.url ?? "", "http://localhost");
        const token = url.searchParams.get("token");
        if (!token) {
            console.error("❌ No token provided");
            ws.send(JSON.stringify({ type: "error", message: "Missing token" }));
            ws.close();
            return;
        }
        const user = jsonwebtoken_1.default.verify(token, "YOUR_SECRET");
        console.log("✅ Token valid:", user);
        ws.send(JSON.stringify({ type: "welcome", message: "Connected to WS server!" }));
        ws.on("message", (msg) => console.log("📩 WS message:", msg.toString()));
        ws.on("close", (code, reason) => {
            console.log(`❌ WS closed: code=${code}, reason=${reason.toString()}`);
        });
        ws.on("error", (err) => {
            console.error("⚠️ WS error:", err);
        });
    }
    catch (err) {
        console.error("❌ Token verification failed:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid or expired token" }));
        ws.close();
    }
});
console.log("🚀 WebSocket server running on ws://192.168.1.23:5001");

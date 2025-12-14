"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("Current working directory:", process.cwd());
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
// 🗺️ Track connected users: userId → socketId
const userSockets = new Map();
// Store offline notifications/messages
const pendingNotifications = new Map();
// 🔑 Socket.IO JWT Middleware
io.use((socket, next) => {
    console.log("🟡 Incoming socket handshake");
    console.log("🔍 socket.handshake.query:", socket.handshake.query);
    const token = socket.handshake.query.token;
    const secret = process.env.JWT_SECRET;
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("PORT:", process.env.PORT);
    console.log("DBS:", process.env.DBS);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    if (!token) {
        console.warn("❌ No token provided in handshake query");
        return next(new Error("not authorized"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("✅ JWT verified. Decoded user:", decoded);
        socket.user = decoded;
        next();
    }
    catch (err) {
        console.error("❌ JWT verification failed:", err);
        return next(new Error("not authorized"));
    }
});
// 🔌 Socket connection
io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    // Auto-register userId from query
    const userId = socket.handshake.query.userId;
    if (userId) {
        console.log("🔑 User registered:", userId, " -> socket:", socket.id);
        userSockets.set(userId, socket.id);
        // Send any pending notifications/messages
        const pending = pendingNotifications.get(userId) || [];
        pending.forEach((notif) => io.to(socket.id).emit("notification", notif));
        pendingNotifications.delete(userId);
    }
    // Manual registration (fallback if query not provided)
    socket.on("register_user", (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });
    // 📩 Handle incoming chat message (from client)
    socket.on("send_message", async (msg) => {
        console.log("📥 Server received message:", msg);
        // Find recipient socket
        const targetSocketId = userSockets.get(String(msg.toUserId));
        if (targetSocketId) {
            console.log(`📡 Delivering message to user ${msg.toUserId} at socket ${targetSocketId}`);
            io.to(targetSocketId).emit("message", msg);
        }
        else {
            console.log(`📦 User ${msg.toUserId} is offline. Storing message.`);
            const pending = pendingNotifications.get(String(msg.toUserId)) || [];
            pending.push({ ...msg, type: "message" });
            pendingNotifications.set(String(msg.toUserId), pending);
        }
        // (Optional) Echo message back to sender so they see it instantly
        const senderSocketId = userSockets.get(String(msg.fromUserId));
        if (senderSocketId) {
            io.to(senderSocketId).emit("message", msg);
        }
    });
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
        for (const [uid, sId] of userSockets.entries()) {
            if (sId === socket.id) {
                console.log(`🗑️ Removing user ${uid} from map`);
                userSockets.delete(uid);
            }
        }
    });
});
// ✅ REST endpoint to trigger notifications manually
app.post("/notify", (req, res) => {
    const { userId, message, type } = req.body;
    if (!userId || !message || !type) {
        return res.status(400).json({ error: "userId, message, and type are required" });
    }
    const targetSocketId = userSockets.get(userId);
    const notification = { message, type };
    if (targetSocketId) {
        io.to(targetSocketId).emit("notification", notification);
        console.log(`✅ Notification sent to ${userId}: ${message} [${type}]`);
        return res.status(200).json({ success: true });
    }
    // Store notification for offline users
    const pending = pendingNotifications.get(userId) || [];
    pending.push(notification);
    pendingNotifications.set(userId, pending);
    console.log(`📦 Stored notification for offline user ${userId}: ${message} [${type}]`);
    return res.status(200).json({ success: true, storedForLater: true });
});
// Catch-all unknown routes
app.all("*", (req, res) => {
    res.status(404).send("Not found");
});
// Utility: Check if user is online
function isUserOnline(userId) {
    return userSockets.has(userId);
}
server.listen(5001, '0.0.0.0', () => console.log("✅ Socket.IO server running on port 5001"));

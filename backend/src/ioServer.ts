import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/bayanihanplus.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/bayanihanplus.com/fullchain.pem"),
};

const server = https.createServer(options,app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

// 🗺️ Track connected users: userId → socketId
const userSockets = new Map<string, string>();
// Store offline notifications/messages
const pendingNotifications = new Map<string, any[]>();

// in-memory map: userId -> socketId (for single device). For multi-device, store array.
export const onlineMap = new Map<string, string>();

// 🔑 Socket.IO JWT Middleware
io.use((socket, next) => {
  console.log("🟡 Incoming socket handshake");
  console.log("🔍 socket.handshake.query:", socket.handshake.query);

  const token = socket.handshake.query.token as string;
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("✅ JWT verified. Decoded user:", decoded);
    (socket as any).user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return next(new Error("not authorized"));
  }
});

// 🔌 Socket connection
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Auto-register userId from query
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    console.log("🔑 User registered:", userId, " -> socket:", socket.id);
    userSockets.set(userId, socket.id);
    // Send any pending notifications/messages
    const pending = pendingNotifications.get(userId) || [];
    pending.forEach((notif) => io.to(socket.id).emit("notification", notif));
    pendingNotifications.delete(userId);

    //Show/Update Friend Request
    onlineMap.set(userId, socket.id);
    io.emit("presence:update", { userId, online: true });
  }
  // notify user of incoming friend request or accept (server triggers)
    socket.on("friend:request:read", (payload) => { /* optional ack */ });

  // Manual registration (fallback if query not provided)
  socket.on("register_user", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
  });

  // 📩 Handle incoming chat message (from client)
  socket.on("send_message",async (msg) => {
    console.log("📥 Server received message:", msg);

    

    // Find recipient socket
    const targetSocketId = userSockets.get(String(msg.toUserId));

    if (targetSocketId) {
      console.log(`📡 Delivering message to user ${msg.toUserId} at socket ${targetSocketId}`);
      io.to(targetSocketId).emit("message", msg);

    } else {

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
        onlineMap.delete(uid);
        io.emit("presence:update", { uid, online: false });
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
function isUserOnline(userId: string) {
  return userSockets.has(userId);
}

server.listen(5001,'0.0.0.0',() => console.log("✅ Socket.IO server running on port 5001"));

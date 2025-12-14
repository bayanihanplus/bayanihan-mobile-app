import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import notificationsRouter from "./routes/notifiCations";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import healthRoutes from "./routes/health";
import postRouter from "./routes/posts";
import itemsRouter from "./routes/item";
import chatsMarketplace from "./routes/chatsmarketplace";
import event from "./routes/event";
import verificationRouter from "./routes/verification";
import updateActivity from "./middleware/updateActivity";
import friendsRoutes from "./routes/friends";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

// Allow requests from localhost:8081 (Expo)
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(updateActivity);

app.use("/api/verification", verificationRouter);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/user", userRoutes); // ✅ this must be here
app.use("/api/posts", postRouter);
app.use("/api/items", itemsRouter);
app.use("/api/chats",chatsMarketplace);
app.use("/api/notifications", notificationsRouter);
app.use("/api/events", event);
app.use("/api/friends", friendsRoutes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

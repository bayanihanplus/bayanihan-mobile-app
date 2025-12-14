"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db")); // your PostgreSQL pool
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = express_1.default.Router();
// ✅ Get unread messages count
router.get("/unread", verifyToken_1.default, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized: No user in token" });
        }
        const userId = parseInt(req.user.id, 10);
        console.log("Parsed userId:", userId, "Type:", typeof userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const result = await db_1.default.query(`SELECT COUNT(*) 
       FROM chats 
       WHERE receiver_id = $1 AND is_read = false`, [userId]);
        return res.json({ unreadCount: Number(result.rows[0].count) });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch unread messages" });
    }
});
// GET messages between current user and seller
router.get("/:sellerId", verifyToken_1.default, async (req, res) => {
    try {
        const userId = req.user?.id; // from token
        const sellerId = Number(req.params.sellerId);
        console.log("GeT SellerID:", req.body);
        const result = await db_1.default.query(`SELECT sender_id, message, created_at 
       FROM chats 
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`, [userId, sellerId]);
        // Map sender_id to username if needed
        const messages = result.rows.map((row) => ({
            sender_id: row.sender_id, // ✅ keep this for reference
            from: row.sender_id === userId ? req.user?.username : "Seller",
            text: row.message,
            created_at: row.created_at,
        }));
        res.json({ messages });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});
// POST a new message
router.post("/:sellerId", verifyToken_1.default, async (req, res) => {
    try {
        console.log("POST SellerID:", req.body);
        const userId = req.user?.id;
        const sellerId = Number(req.params.sellerId);
        const message = req.body.text;
        await db_1.default.query(`INSERT INTO chats (sender_id, receiver_id, message, is_read)
     VALUES ($1, $2, $3, false)`, [userId, sellerId, message]);
        res.status(201).json({ message: "Message sent successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to send message" });
    }
});
exports.default = router;

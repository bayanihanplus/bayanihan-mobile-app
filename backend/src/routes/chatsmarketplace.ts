import express from "express";
import pool from "../config/db"; // your PostgreSQL pool
import  verifyToken,{AuthRequest}  from "../middleware/verifyToken";

const router = express.Router();

// ✅ Get unread messages count
router.get("/unread", verifyToken, async (req: any, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: No user in token" });
    }
    const userId = parseInt(req.user.id, 10);
    console.log("Parsed userId:", userId, "Type:", typeof userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const result = await pool.query(
      `SELECT COUNT(*) 
       FROM chats 
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );
    return res.json({ unreadCount: Number(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread messages" });
  }
});

// GET messages between current user and seller
router.get("/:sellerId", verifyToken, async (req: AuthRequest, res) => {
  
  try {

    const userId = req.user?.id; // from token
    const sellerId = Number(req.params.sellerId);
    console.log("GeT SellerID:",req.body);
    const result = await pool.query(
      `SELECT sender_id, message, created_at 
       FROM chats 
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId, sellerId]
    );

    // Map sender_id to username if needed
    const messages = result.rows.map((row: any) => ({
      sender_id: row.sender_id, // ✅ keep this for reference
      from: row.sender_id === userId ? req.user?.username : "Seller",
      text: row.message,
      created_at: row.created_at,
    }));

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST a new message
router.post("/:sellerId", verifyToken, async (req: AuthRequest, res) => {

  try {
    console.log("POST SellerID:",req.body);
    const  userId   = req.user?.id;
    const  sellerId = Number(req.params.sellerId);
    const  message  = req.body.text;

    await pool.query(
     `INSERT INTO chats (sender_id, receiver_id, message, is_read)
     VALUES ($1, $2, $3, false)`,
      [userId, sellerId, message]
    );
    
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});




export default router;

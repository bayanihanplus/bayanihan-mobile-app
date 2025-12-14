import { Router } from "express";
import pool from "../config/db"; // adjust path if needed
import { Request, Response } from "express";
import { io, onlineMap } from "../ioServer"; // import from your central server file
import verifyToken, { AuthRequest } from "../middleware/verifyToken";

const router = Router();

// send friend request
router.post("/request", verifyToken ,async (req: AuthRequest, res: Response) => {
    
  const requesterId = req.user?.id;
  const { recipientId } = req.body;
  if (!requesterId) return res.status(401).json({ error: "unauth" });
    
  if (requesterId === recipientId) return res.status(400).json({ error: "self" });

  try {
    // upsert with unique constraint
    await pool.query(
      `INSERT INTO friend_requests (requester_id, recipient_id, status)
       VALUES ($1,$2,'pending')
       ON CONFLICT (requester_id, recipient_id) DO UPDATE
         SET status = EXCLUDED.status, updated_at = now()
       RETURNING *`,
      [requesterId, recipientId]
    );

    // ✅ Emit notification if recipient is online
    const recipientSocketId = onlineMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("friend:request", { from: requesterId });
    }

    // optionally notify recipient via socket (emit later)
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server" });
  }
});

// accept request
router.post("/accept", async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // the recipient
  const { requesterId } = req.body;
  if (!userId) return res.status(401).json({ error: "unauth" });

  try {
    // update status
    const r = await pool.query(
      `UPDATE friend_requests SET status='accepted', updated_at=now()
       WHERE requester_id=$1 AND recipient_id=$2
       RETURNING *`,
      [requesterId, userId]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "not found" });

    // insert friendship (symmetric)
    const a = Math.min(requesterId, userId), b = Math.max(requesterId, userId);
    await pool.query(
      `INSERT INTO friendships (user_a,user_b) VALUES ($1,$2)
       ON CONFLICT (LEAST(user_a,user_b), GREATEST(user_a,user_b)) DO NOTHING`,
      [a, b]
    );

    // optionally notify requester via socket
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server" });
  }
});

// decline
router.post("/decline", async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { requesterId } = req.body;
  try {
    await pool.query(
      `UPDATE friend_requests SET status='declined', updated_at=now()
       WHERE requester_id=$1 AND recipient_id=$2`,
      [requesterId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "server" });
  }
});

// block (either requester blocks recipient or recipient blocks requester)
router.post("/block", async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { targetId } = req.body;
  try {
    // set a friend_request row with status blocked (ensure unique pair direction)
    await pool.query(
      `INSERT INTO friend_requests (requester_id, recipient_id, status)
       VALUES ($1,$2,'blocked')
       ON CONFLICT (requester_id, recipient_id) DO UPDATE
         SET status='blocked', updated_at=now()`,
      [userId, targetId]
    );
    // remove friendship if exists
    const a = Math.min(userId, targetId), b = Math.max(userId, targetId);
    await pool.query(
      `DELETE FROM friendships WHERE LEAST(user_a,user_b)=$1 AND GREATEST(user_a,user_b)=$2`,
      [a, b]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "server" });
  }
});

// list current friends & pending statuses
router.get("/list", verifyToken,async (req: AuthRequest, res: Response) => {
  console.log("Token from header:", req.headers.authorization);
  const userId = (req as any).user?.id;
  try {
    // friends
    const friendsQ = await pool.query(
      `SELECT u.id, u.username, u.profile_picture, u.last_active
       FROM friendships f
       JOIN users u ON (u.id = CASE WHEN f.user_a = $1 THEN f.user_b ELSE f.user_a END)
       WHERE f.user_a = $1 OR f.user_b = $1`,
      [userId]
    );

    // incoming pending requests
    const incomingQ = await pool.query(
      `SELECT fr.requester_id AS id, u.username, u.profile_picture, fr.status, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.requester_id
       WHERE fr.recipient_id = $1 AND fr.status = 'pending'`,
      [userId]
    );

    // outgoing pending
    const outgoingQ = await pool.query(
      `SELECT fr.recipient_id AS id, u.username, u.profile_picture, fr.status, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.recipient_id
       WHERE fr.requester_id = $1 AND fr.status = 'pending'`,
      [userId]
    );

    res.json({
      friends: friendsQ.rows,
      incoming: incomingQ.rows,
      outgoing: outgoingQ.rows,
    });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "server" });
  }
});

export default router;

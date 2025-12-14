import { Router, Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../middleware/verifyToken";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.get("/", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log("✅ req.user:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const userId = req.user.id;
    console.log("Fetching notifications for userId:", userId);

    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    console.log("Notifications from DB:", result.rows);

    res.json({ notifications: result.rows });
  } catch (err) {
    console.error("💥 /notifications ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

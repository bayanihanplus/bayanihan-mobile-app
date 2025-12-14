import express from "express";
import verifyToken, { AuthRequest } from "../middleware/verifyToken"; // ✅ correct import
import pool from "../config/db";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/profile", verifyToken, async (req: AuthRequest, res) => {

  try {

    const result = await pool.query(
      "SELECT id, username, email, address, profile_picture FROM users WHERE id=$1",
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ✅ Multer setup for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ PUT /api/user/profile
router.put("/profile", verifyToken, upload.single("profile_picture"), async (req: AuthRequest, res) => {
  try {
    const { username, email, address } = req.body;
    const profilePicture = req.file?.filename ?? null;

    // Fetch old profile picture
    const oldUser = await pool.query("SELECT profile_picture FROM users WHERE id=$1", [req.user!.id]);
    const oldPic = oldUser.rows[0].profile_picture;

    // Update DB
    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           address = COALESCE($3, address),
           profile_picture = COALESCE($4::text, profile_picture)
       WHERE id = $5
       RETURNING id, username, email, address, profile_picture`,
      [username, email, address, profilePicture, req.user!.id]
    );

    // Delete old file **after DB update**, but do NOT send another response
    if (profilePicture && oldPic) {
      const oldPath = path.join("uploads", oldPic);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // ✅ Send response once, at the very end
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Only send error response once
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
});

router.get("/users",async (req,res) =>{
  try {
      const result = await pool.query(
        `SELECT 
          id, 
          username,
          profile_picture,
          last_active
          FROM users
          ORDER BY username ASC`
      );
      const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const users = result.rows.map((user) => {
          let online = false;
          if (user.last_active) {
            const last = new Date(user.last_active).getTime();
            const diff = Date.now() - last;
            online = diff <= ONLINE_THRESHOLD;
          }

          return {
            ...user,
            online,
          }
      });
      res.json(users);
  } catch (error) {
      console.error("Error fetching users", error);
      res.status(500).json({ error: "Server error" });
  }
});

router.post("/update-last-active", async (req, res) => {
  const userId = req.body.userId; // ideally from auth token/session
  try {
    await pool.query(
      "UPDATE users SET last_active = NOW() WHERE id = $1",
      [userId]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating last_active", err);
    res.sendStatus(500);
  }
});

export default router;

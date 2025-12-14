import express from "express";
import pool from "../config/db"; // your DB config
import multer from "multer";
import path from "path";
import fs from "fs";
import  verifyToken,{AuthRequest}  from "../middleware/verifyToken";

const router = express.Router();

// ----------------- Multer setup -----------------
const storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    const userId = req as AuthRequest;
    const userFolder = path.join(__dirname, `../../uploads/${userId.user?.id}`);

    // create folder if it doesn't exist
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.includes("image") ? ".jpg" : ".mp4");
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname) + ext);
  },
});

const upload = multer({ storage });

// ----------------- Routes -----------------

// GET all posts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.profile_picture
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new post (image/video)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {

    const { user_id,caption, type } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await pool.query(
      `INSERT INTO posts (user_id, image_url, caption, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id,req.file.filename, caption, type]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Server error" });
  }
});

// POST like
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;

    // Increment likes
    const result = await pool.query(
      `UPDATE posts SET likes = COALESCE(likes,0) + 1 WHERE id=$1 RETURNING likes`,
      [postId]
    );

    res.json({ likes: result.rows[0].likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET comments
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await pool.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST comment
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, text } = req.body;

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, text)
       VALUES ($1, $2, $3) RETURNING *`,
      [postId, userId, text]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

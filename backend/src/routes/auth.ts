import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ REGISTER
router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email,userName: user.username}, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture
          ? `http://bayanihanplus.com:5000/uploads/${user.profile_picture}`
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/pin-login", async (req: Request , res :  Response) => {
  try {
    console.log("Request:",req);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ REFRESH TOKEN
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Missing token" });

    const oldToken = authHeader.split(" ")[1];

    // decode token even if expired
    const decoded: any = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });

    // create a fresh token
    const newToken = jwt.sign({ id: decoded.id,userName: decoded.username, email: decoded.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: newToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});
// ✅ FORGOT PASSWORD
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

     // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000); 
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min


    // Save hashed token to DB
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [code, expires, email]
    );

   // Send code via email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"BayanihanApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html: `<p>Hello ${user.username || ""},</p>
             <p>Your password reset code is: <strong>${code}</strong></p>
             <p>It expires in 10 minutes.</p>`,
    });

    res.json({ message: "Reset code sent to your email." });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashedCode = code.toString();
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()",
      [email, hashedCode]
    );

    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Invalid or expired code" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;

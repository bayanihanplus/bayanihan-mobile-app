"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
// ✅ REGISTER
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ message: "All fields are required" });
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const result = await db_1.default.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email", [username, email, hashedPassword]);
        res.status(201).json({ user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        if (err.code === "23505") {
            return res.status(400).json({ message: "Email or username already exists" });
        }
        res.status(500).json({ message: "Server error" });
    }
});
// ✅ LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });
    try {
        const result = await db_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, userName: user.username }, JWT_SECRET, {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ✅ REFRESH TOKEN
router.post("/refresh", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ message: "Missing token" });
        const oldToken = authHeader.split(" ")[1];
        // decode token even if expired
        const decoded = jsonwebtoken_1.default.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });
        // create a fresh token
        const newToken = jsonwebtoken_1.default.sign({ id: decoded.id, userName: decoded.username, email: decoded.email }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({ token: newToken });
    }
    catch (err) {
        console.error("Refresh token error:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});
// ✅ FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Email is required" });
    try {
        const result = await db_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Generate token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Save hashed token to DB
        await db_1.default.query("UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3", [hashedToken, resetTokenExpires, email]);
        const resetLinkWeb = `https://bayanihanplus.com/reset-password/${resetToken}`;
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false, // set true if your SMTP supports TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
            from: `"Bayanihan App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.username || ""},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLinkWeb}" target="_blank">${resetLinkWeb}</a>
        <p>This link will expire in 1 hour.</p>
      `,
        });
        res.json({ message: "Reset link sent to your email." });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// ✅ RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword)
        return res.status(400).json({ message: "New password is required" });
    try {
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const result = await db_1.default.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()", [hashedToken]);
        const user = result.rows[0];
        if (!user)
            return res.status(400).json({ message: "Invalid or expired token" });
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.default.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2", [hashedPassword, user.id]);
        res.json({ message: "Password reset successful." });
    }
    catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;

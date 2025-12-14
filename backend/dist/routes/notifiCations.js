"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Missing token" });
    const token = authHeader.split(" ")[1];
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
// GET /notifications
router.get("/", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db_1.default.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        res.json({ notifications: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader); // 👀
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); // 👀
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // 👀
        req.user = { id: Number(decoded.id), username: decoded.username, email: decoded.email }; // <-- Ensure number
        next();
    }
    catch (err) {
        console.error("JWT Verification Error:", err); // 👀
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

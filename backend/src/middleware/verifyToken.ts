import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
  user?: { id: number; email?: string; username?: string };
}

export default function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
   if (!token) {
    // No token provided, just skip verification instead of throwing an error
    return next(); // or return res.status(401).json({ message: "No token" }) if you want to block
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email?: string;
      username?: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

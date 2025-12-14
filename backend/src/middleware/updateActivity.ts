import { Request, Response, NextFunction } from "express";
import pool from "../config/db"; // your PG pool

export default async function updateActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id; // depending on your auth system

  if (userId) {
    try {
      await pool.query(
        `UPDATE users SET last_active = NOW() WHERE id = $1`,
        [userId]
      );
    } catch (err) {
      console.error("Failed to update activity", err);
    }
  }

  next();
}

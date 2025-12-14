import { Router } from "express";
import pool from "../config/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

export default router;

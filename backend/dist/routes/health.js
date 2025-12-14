"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const result = await db_1.default.query("SELECT NOW()");
        res.json({ status: "ok", dbTime: result.rows[0].now });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database connection failed" });
    }
});
exports.default = router;

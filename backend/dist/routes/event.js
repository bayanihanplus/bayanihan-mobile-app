"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db")); // adjust path if needed
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const user_id = req.user?.id;
        const tempFolder = path_1.default.join("uploads", String(user_id), "events", "event_temp");
        if (!fs_1.default.existsSync(tempFolder))
            fs_1.default.mkdirSync(tempFolder, { recursive: true });
        cb(null, tempFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "_" + file.originalname;
        cb(null, uniqueName);
    },
});
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage });
// ✅ Get all events
router.get("/", async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM events ORDER BY created_at DESC");
        console.log(result);
        return res.status(200).json({
            success: true,
            events: result.rows,
            "From Database": result,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching events" });
    }
});
// ✅ Add new event
router.post("/", verifyToken_1.default, upload.single("banneruri"), async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { title, description, date, time, location, category } = req.body;
        // 🛑 1) Validate required fields before renaming file
        if (!user_id || !title || !date || !time || !category) {
            // ✅ If multer uploaded a file but validation failed, delete the temp file
            if (req.file?.path) {
                console.log("🧹 Deleting temp file due to validation error:", req.file.path);
                fs_1.default.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                required: [user_id, title, date, time, category],
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No banner uploaded" });
        }
        const finalFolder = path_1.default.join("uploads", String(user_id), "events", String(category));
        if (!fs_1.default.existsSync(finalFolder))
            fs_1.default.mkdirSync(finalFolder, { recursive: true });
        let bannerPath = null;
        if (req.file) {
            const newPath = path_1.default.join(finalFolder, req.file.filename);
            fs_1.default.renameSync(req.file.path, newPath);
            bannerPath = newPath;
        }
        const result = await db_1.default.query(`INSERT INTO events (title, description, date, time, location, category, bannerUri)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`, [title, description, date, time, location, category, bannerPath]);
        const newEvent = result.rows[0];
        return res.status(201).json({
            success: true,
            message: "Event added successfully",
            event: newEvent,
        });
    }
    catch (error) {
        console.error("Error creating event:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
// ✅ Add comment to event
router.post("/:id/comments", verifyToken_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const username = req.user?.username || "Unknown";
        if (!text) {
            return res.status(400).json({ success: false, message: "Comment text is required" });
        }
        const result = await db_1.default.query(`INSERT INTO comments (event_id, username, text)
       VALUES ($1,$2,$3) RETURNING *`, [id, username, text]);
        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: result.rows[0],
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
// ✅ Get comments for an event
router.get("/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("SELECT * FROM comments WHERE event_id=$1 ORDER BY created_at ASC", [id]);
        return res.status(200).json({ success: true, comments: result.rows });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.default = router;

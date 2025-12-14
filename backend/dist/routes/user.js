"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middleware/verifyToken")); // ✅ correct import
const db_1 = __importDefault(require("../config/db"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
router.get("/profile", verifyToken_1.default, async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT id, username, email, address, profile_picture FROM users WHERE id=$1", [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});
// ✅ Multer setup for file upload
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
// ✅ PUT /api/user/profile
router.put("/profile", verifyToken_1.default, upload.single("profile_picture"), async (req, res) => {
    try {
        const { username, email, address } = req.body;
        const profilePicture = req.file?.filename ?? null;
        // Fetch old profile picture
        const oldUser = await db_1.default.query("SELECT profile_picture FROM users WHERE id=$1", [req.user.id]);
        const oldPic = oldUser.rows[0].profile_picture;
        // Update DB
        const result = await db_1.default.query(`UPDATE users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           address = COALESCE($3, address),
           profile_picture = COALESCE($4::text, profile_picture)
       WHERE id = $5
       RETURNING id, username, email, address, profile_picture`, [username, email, address, profilePicture, req.user.id]);
        // Delete old file **after DB update**, but do NOT send another response
        if (profilePicture && oldPic) {
            const oldPath = path_1.default.join("uploads", oldPic);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        // ✅ Send response once, at the very end
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        // Only send error response once
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to update profile" });
        }
    }
});
exports.default = router;

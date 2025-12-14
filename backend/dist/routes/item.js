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
        const tempFolder = path_1.default.join("uploads", String(user_id), "itemShop", "temp");
        if (!fs_1.default.existsSync(tempFolder))
            fs_1.default.mkdirSync(tempFolder, { recursive: true });
        cb(null, tempFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "_" + file.originalname;
        cb(null, uniqueName);
    }
});
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage });
// ✅ Get all items
router.get("/", async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM items ORDER BY created_at DESC");
        return res.status(200).json({
            success: true,
            items: result.rows, // ✅ this is the array the frontend expects
            "From Database:": result
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching items" });
    }
});
// ✅ Add new item
router.post("/", verifyToken_1.default, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }
        const user_id = req.user?.id;
        const category = req.body?.category;
        const username = req.body?.username;
        const item_name = req.body?.item_name;
        const price = req.body?.price;
        if (!user_id || !category || !username || !item_name || !price) {
            return res.status(400).json({
                success: false,
                message: "Missing Required Fields",
                required: [user_id, category, username, item_name, price]
            });
        }
        const finalFolder = path_1.default.join("uploads", String(user_id), "itemShop", String(category));
        if (!fs_1.default.existsSync(finalFolder))
            fs_1.default.mkdirSync(finalFolder, { recursive: true });
        let imagePath = null;
        if (req.file) {
            const newPath = path_1.default.join(finalFolder, req.file.filename);
            fs_1.default.renameSync(req.file.path, newPath);
            imagePath = newPath;
        }
        const result = await db_1.default.query(`INSERT INTO items (user_id, username, item_name, price, category, image)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`, [user_id, username, item_name, price, category, imagePath]);
        const New_item = result.rows[0];
        return res.status(201).json({
            success: true,
            message: "Item added successfully",
            item: New_item
        });
    }
    catch (error) {
        console.error("Error creating item:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.default = router;

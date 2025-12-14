import express from "express";
import pool from "../config/db"; // adjust path if needed
import  verifyToken,{AuthRequest}  from "../middleware/verifyToken";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req: any,file,cb) => {
    const user_id = req.user?.id;
    const tempFolder = path.join("uploads",String(user_id),"itemShop","temp");
  
    if(!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder,{recursive: true});
    cb(null,tempFolder);
  },
  filename: (req,file,cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null,uniqueName);
  }
});

const router = express.Router();
const upload = multer({ storage });

// ✅ Get all items
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY created_at DESC");
      
      return res.status(200).json({
        success: true,
        items: result.rows,  // ✅ this is the array the frontend expects
       "From Database:":result
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// ✅ Add new item
router.post("/", verifyToken,upload.single("image"), async (req: AuthRequest, res) => {

    try {
    
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
   
       const user_id = req.user?.id;
       const category = req.body?.category;
       const username = req.body?.username;
       const item_name = req.body?.item_name;
       const price = req.body?.price;
        
       if(!user_id || !category || !username || !item_name || !price) {
        return  res.status(400).json({
            success: false,
            message: "Missing Required Fields",
            required: [user_id,category,username,item_name,price]
          });
       }
       const finalFolder = path.join("uploads",String(user_id),"itemShop",String(category));
       if(!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder,{recursive:true});

      let imagePath = null;

       if(req.file){
          const newPath = path.join(finalFolder,req.file.filename);
          fs.renameSync(req.file.path,newPath);
          imagePath = newPath;
      }
     
       const result = await pool.query(
            `INSERT INTO items (user_id, username, item_name, price, category, image)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [user_id, username, item_name, price, category, imagePath]
          );
          const New_item = result.rows[0];
            return res.status(201).json({
                      success: true,
                      message: "Item added successfully",
                      item: New_item
                    });
    } catch (error) {
        console.error("Error creating item:", error);
    return   res.status(500).json({success: false,message: "Internal Server Error"});
    }
});
router.post("/save-final-data", async (req : AuthRequest , res ) => {
  const {userId,stepData} = req.body;
  console.log(req.body);
  if(!userId) {
    return res.status(400).json({ message: "user_id" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO coopregistration (user_id, savestepprogress) 
       VALUES ($1, $2) ON CONFLICT(user_id) DO NOTHING RETURNING *`,
      [userId, stepData]
    );
    if (result.rowCount === 0) {
      return res.status(200).json({ message: "Already exists" });
    } else {
      return res.status(200).json({ message: "Saved successfully" });
    }
  } catch (err: unknown) {
   // Narrow the type
  if (err instanceof Error) {
        console.error("❌ Error inserting transaction:", err.message);
      res.status(500).json({ success: false, error: err.message });
      } else {
        console.error("❌ Unknown error inserting transaction:", err);
        res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
});

router.get("/get-final-status/:userId", async (req,res) => {
  const { userId } = req.params;
  try {
    
    const result = await pool.query(`SELECT savestepprogress from coopregistration where user_id= $1 ORDER BY created_at DESC LIMIT 1`,[userId]);

    if(result.rows.length === 0){
      return res.status(200).json({ completed: false });
    }
    const progress = result.rows[0].savestepprogress;
    return res.status(200).json({
      completed : progress === "AllStepsDone",
      progress
    });
  } catch (error) {
    console.error("❌ Error fetching progress:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

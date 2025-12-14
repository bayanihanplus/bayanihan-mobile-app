import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db";
import * as faceapi from "face-api.js";
import { Canvas, Image, ImageData, loadImage } from "canvas";

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/verification/temp";
    if (file.fieldname === "selfie") folder = "uploads/verification/selfies";
    if (file.fieldname === "idImage") folder = "uploads/verification/ids";
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Load face models
const MODEL_URL = path.join(process.cwd(), "./uploads/models");
let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
  ]);
  modelsLoaded = true;
  console.log("✅ Face recognition models loaded!");
};
loadModels();

// POST /verify
router.post(
  "/verify",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "idImage", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      if (!userId) return res.status(400).json({ error: "User ID is required" });

      const idImagePath = (req.files as any)?.idImage?.[0]?.path;
      const selfieImagePath = (req.files as any)?.selfie?.[0]?.path;

      if (!idImagePath || !selfieImagePath) {
        return res.status(400).json({ error: "Both images must be uploaded." });
      }

      const [idImage, selfieImage] = await Promise.all([
        loadImage(idImagePath),
        loadImage(selfieImagePath),
      ]);

      const [idFace, selfieFace] = await Promise.all([
        faceapi.detectSingleFace(idImage).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(selfieImage).withFaceLandmarks().withFaceDescriptor(),
      ]);

      if (!idFace || !selfieFace) {
        fs.unlinkSync(idImagePath);
        fs.unlinkSync(selfieImagePath);
        return res.status(400).json({ error: "No face detected in one or both images." });
      }

      const distance = faceapi.euclideanDistance(idFace.descriptor, selfieFace.descriptor);
      const match = distance < 0.5;
      const confidence = Math.max(0, (1 - distance) * 100).toFixed(2);

      // Save result in DB
      const result = await pool.query(
        `UPDATE users 
         SET verification_status = $1,
             verification_confidence = $2,
             verification_distance = $3,
             verified_at = NOW()
         WHERE id = $4
         RETURNING id, verification_status, verification_confidence, verified_at`,
        [match ? "verified" : "failed", confidence, distance, userId]
      );

      // Move files to completed folder
      const userFolder = path.join("uploads/verification/completed", String(userId));
      fs.mkdirSync(userFolder, { recursive: true });

      const savedSelfiePath = path.join(userFolder, path.basename(selfieImagePath));
      const savedIDPath = path.join(userFolder, path.basename(idImagePath));

      fs.renameSync(selfieImagePath, savedSelfiePath);
      fs.renameSync(idImagePath, savedIDPath);

      res.json({
        verified: match,
        confidence: `${confidence}%`,
        distance,
        user: result.rows[0],
        files: { selfie: savedSelfiePath, idImage: savedIDPath },
      });
    } catch (err) {
      console.error("[VERIFY ERROR]", err);
      res.status(500).json({ error: "Verification failed." });
    }
  }
);

export default router;

// backend/routes/prescriptionRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadFile,
  listPrescriptions,
  getFileBytes,
  deletePrescription,
} from "../controller/prescriptionController.js";
import { requireAuth } from "../middleware/authMiddleware.js"; // assumes this exists

const router = express.Router();

// Multer memory storage (small uploads). Set file size limit (10MB).
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// POST /api/prescriptions/upload
// Protected - uses requireAuth (which sets req.userId)
router.post("/upload", requireAuth, upload.single("file"), uploadFile);

// GET /api/prescriptions
router.get("/", requireAuth, listPrescriptions);

// GET /api/prescriptions/files/:id  -> returns raw bytes
router.get("/files/:id", requireAuth, getFileBytes);

// DELETE /api/prescriptions/:id
router.delete("/:id", requireAuth, deletePrescription);

export default router;

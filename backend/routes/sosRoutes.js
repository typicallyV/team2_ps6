import express from "express";
import { sendEmergencySOS } from "../controller/sosController.js";

const router = express.Router();

// POST /api/sos/send - Send emergency SOS
router.post("/send", sendEmergencySOS);

export default router;
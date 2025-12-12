import express from "express";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../controller/reminderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getReminders);
router.post("/", createReminder);
router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
import express from "express";
import { addMood, getMoods, deleteMood } from "../controller/moodController.js";

const router = express.Router();

router.post("/", addMood);
router.get("/", getMoods);
router.delete("/:id", deleteMood);

export default router;

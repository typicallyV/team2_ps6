import express from "express";
import {
  completeOnboarding,
  getOnboardingStatus,
  updateOnboarding
} from "../controller/onboardingController.js";

const router = express.Router();

// All routes require authentication via session (checked in controller)

// POST /api/onboarding/complete - Complete onboarding process
router.post("/complete", completeOnboarding);

// GET /api/onboarding/status - Get onboarding status
router.get("/status", getOnboardingStatus);

// PUT /api/onboarding/update - Update onboarding data
router.put("/update", updateOnboarding);

export default router;
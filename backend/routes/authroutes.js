 // routes/authRoutes.js
import express from "express";
import { 
  postRegister, 
  postLogin, 
  postLogout, 
  getProfile 
} from "../controller/authControllers.js";  

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", postRegister);

// POST /api/auth/login
router.post("/login", postLogin);

// POST /api/auth/logout
router.post("/logout", postLogout);

// GET /api/auth/profile (protected)
router.get("/profile", requireAuth, getProfile);

export default router;

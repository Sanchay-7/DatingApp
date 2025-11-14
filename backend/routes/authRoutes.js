import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  signup,
  login,
  resetPassword,
  forgotPassword,
  checkAuthStatus,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ Signup (Firebase OTP verified on backend)
router.post("/signup", signup);

// ✅ Login (email/phone + password)
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

// ✅ Check Status (Used by Waiting Room)
router.get("/status", authMiddleware, checkAuthStatus);

export default router;
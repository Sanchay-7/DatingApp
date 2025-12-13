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
// Backward-compatible alias for clients hitting /signin
router.post("/signin", login);

// Optional: return a helpful message on GET /signin (browser visits)
router.get("/signin", (req, res) => {
  res.status(405).json({ error: "Use POST /api/auth/signin" });
});
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

// ✅ Check Status (Used by Waiting Room)
router.get("/status", authMiddleware, checkAuthStatus);

export default router;
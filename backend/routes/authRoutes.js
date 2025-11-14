import express from "express";
import { signup, login, checkAuthStatus } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ✅ Signup (Firebase OTP verified on backend)
router.post("/signup", signup);

// ✅ Login (email/phone + password)
router.post("/login", login);

// ✅ Check Status (Used by Waiting Room)
router.get("/status", authMiddleware, checkAuthStatus);

export default router;
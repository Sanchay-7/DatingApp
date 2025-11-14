import express from "express";
import {
  signup,
  login,
  resetPassword,
  forgotPassword,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ Signup (Firebase OTP verified on backend)
router.post("/signup", signup);

// ✅ Login (email/phone + password)
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

export default router;

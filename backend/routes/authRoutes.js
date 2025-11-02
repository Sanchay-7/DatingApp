import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

// ✅ Signup (Firebase OTP verified on backend)
router.post("/signup", signup);

// ✅ Login (email/phone + password)
router.post("/login", login);

export default router;

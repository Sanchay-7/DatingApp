import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  updateProfile,
  updatePreferences,
} from "../controllers/userController.js";

const router = express.Router();

router.put("/update-profile", authMiddleware, updateProfile);
router.put("/update-preferences", authMiddleware, updatePreferences);

export default router;

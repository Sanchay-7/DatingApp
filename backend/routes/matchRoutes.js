import express from "express";
import { getProfiles } from "../controllers/matchController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// 🧭 GET: Discover profiles (Bumble-style logic)
router.get("/getProfiles", authMiddleware, getProfiles);

export default router;

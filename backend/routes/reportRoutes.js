import express from "express";
import { createReport } from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// User creates a report
router.post("/", authMiddleware, createReport);

export default router;

import express from "express";
import {
  adminLogin,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getAnalytics,
  getModerationQueue,
  dismissReport,
  banReportedUser,
} from "../controllers/adminController.js";
import { authAdmin } from "../middleware/authAdmin.js"; // Import our new middleware

const router = express.Router();

// --- Public Admin Routes ---
// POST /api/v1/admin/login
router.post("/login", adminLogin);

// --- Protected Admin Routes ---
// These routes all require a valid admin token

// GET /api/v1/admin/users/pending
router.get("/users/pending", authAdmin, getPendingUsers);

// GET /api/v1/admin/analytics
router.get("/analytics", authAdmin, getAnalytics);

// GET /api/v1/admin/moderation
router.get("/moderation", authAdmin, getModerationQueue);

// POST /api/v1/admin/moderation/dismiss
router.post("/moderation/dismiss", authAdmin, dismissReport);

// POST /api/v1/admin/moderation/ban
router.post("/moderation/ban", authAdmin, banReportedUser);

// GET /api/v1/admin/users/all
router.get("/users/all", authAdmin, getAllUsers);

// PUT /api/v1/admin/users/:userId/approve
router.put("/users/:userId/approve", authAdmin, approveUser);

// PUT /api/v1/admin/users/:userId/reject
router.put("/users/:userId/reject", authAdmin, rejectUser);

export default router;
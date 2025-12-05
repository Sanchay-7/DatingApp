import express from "express";
import multer from "multer";
import { authMiddleware, requireActiveAccount } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadImage,
  updateProfile,
  updatePreferences,
  getMyProfile,
  getUserSettings,
  getUserLikes,
  getDashboardData,
  recordDislike,
  recordLike,
  deleteAccount,
  reportUser,
  updateLocation,
  useBacktrack,
  setTravelMode,
  uploadSelfie
} from "../controllers/userController.js";

const router = express.Router();

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  handleUploadError,
  uploadImage
);

// ⭐ NEW SELFIE UPLOAD ROUTE ⭐
router.post(
  "/upload-selfie",
  authMiddleware,
  upload.single("selfie"),  // frontend field: formData.append("selfie", file)
  handleUploadError,
  uploadSelfie
);

// Profile setup routes - allow PENDING users to complete profile
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/update-preferences", authMiddleware, updatePreferences);

// Protected routes - require ACTIVE account (approved by admin)
router.put("/update-location", authMiddleware, requireActiveAccount, updateLocation);
router.get("/me", authMiddleware, requireActiveAccount, getMyProfile);
router.get("/settings", authMiddleware, requireActiveAccount, getUserSettings);
router.get("/likes", authMiddleware, requireActiveAccount, getUserLikes);
router.get("/dashboard", authMiddleware, requireActiveAccount, getDashboardData);
router.post("/dislike", authMiddleware, requireActiveAccount, recordDislike);
router.post("/like", authMiddleware, requireActiveAccount, recordLike);
router.post("/backtrack", authMiddleware, requireActiveAccount, useBacktrack);
router.post("/travel-mode", authMiddleware, requireActiveAccount, setTravelMode);
router.delete("/delete-account", authMiddleware, requireActiveAccount, deleteAccount);
router.post("/report", authMiddleware, requireActiveAccount, reportUser);

export default router;

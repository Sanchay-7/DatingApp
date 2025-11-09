import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadImage,
  updateProfile,
  updatePreferences,
  getMyProfile,
  getDiscoverUsers,
  likeUser,
  skipUser,
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
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/update-preferences", authMiddleware, updatePreferences);
router.get("/me", authMiddleware, getMyProfile);

// GET users for the dashboard
router.get("/discover", authMiddleware, getDiscoverUsers);

// POST a 'like' action
router.post("/like", authMiddleware, likeUser);

// POST a 'skip' action
router.post("/skip", authMiddleware, skipUser);

export default router;
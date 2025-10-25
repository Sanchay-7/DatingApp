import express from "express";
import { signup , verifyOTP , login} from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Signup route
// router.post("/signup", signup);
router.post("/signup", upload.single("profileImage"), signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);


export default router;

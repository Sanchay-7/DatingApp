import express from "express";
import { createOrder, verifyPayment, paymentWebhook } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Create an order
router.post("/create", authMiddleware, createOrder);

// Verify payment after frontend callback
router.post("/verify", authMiddleware, verifyPayment);

// Cashfree webhook (no auth needed)
router.post("/webhook", paymentWebhook);

export default router;

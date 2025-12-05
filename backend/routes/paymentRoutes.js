import express from "express";
import { createOrder, verifyPayment, paymentWebhook } from "../controllers/paymentController.js";
import { authMiddleware, requireActiveAccount } from "../middleware/auth.js";

const router = express.Router();

// Create an order - require active account
router.post("/create", authMiddleware, requireActiveAccount, createOrder);

// Verify payment after frontend callback - require active account
router.post("/verify", authMiddleware, requireActiveAccount, verifyPayment);

// Cashfree webhook (no auth needed)
router.post("/webhook", paymentWebhook);

export default router;

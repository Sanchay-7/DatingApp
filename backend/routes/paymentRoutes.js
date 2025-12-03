import express from "express";
import { createOrder, verifyPayment, paymentWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// Create an order
router.post("/create", createOrder);

// Verify payment after frontend callback
router.post("/verify", verifyPayment);

// Cashfree webhook
router.post("/webhook", paymentWebhook);

export default router;

import express from "express";
import { createOrder, verifyPayment, paymentWebhook, checkPaymentConfig, submitManualProof, listManualProofs, decideManualProof } from "../controllers/paymentController.js";
import { authMiddleware, requireActiveAccount } from "../middleware/auth.js";
import { authAdmin } from "../middleware/authAdmin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create an order - require active account
router.post("/create", authMiddleware, requireActiveAccount, createOrder);

// Verify payment after frontend callback - require active account
router.post("/verify", authMiddleware, requireActiveAccount, verifyPayment);

// Cashfree webhook (no auth needed)
router.post("/webhook", paymentWebhook);

// Diagnostic endpoint - check payment configuration (no auth for debugging)
router.get("/config/check", checkPaymentConfig);

// Manual payment proof upload (user)
router.post("/manual/proof", authMiddleware, requireActiveAccount, upload.single("proof"), submitManualProof);

// Admin: list and decide manual proofs
router.get("/manual/pending", authAdmin, listManualProofs);
router.post("/manual/:orderId/decision", authAdmin, decideManualProof);

export default router;

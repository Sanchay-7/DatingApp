import prisma from "../config/db.js";
import fetch from "node-fetch";
import crypto from "crypto";

// Determine Cashfree endpoint based on environment
const getCashfreeUrl = () => {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";
};

export const createOrder = async (req, res) => {
  try {
    console.log("CreateOrder request body:", req.body);

    const { userId, amount, email, phone } = req.body;

    // ✅ Check required parameters
    if (!userId || !amount || !email || !phone) {
      console.error("Missing parameters:", { userId, amount, email, phone });
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // ✅ Check user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error("User not found for id:", userId);
      return res.status(400).json({ error: "User not found" });
    }

    const orderData = {
      order_amount: Number(amount),
      order_currency: "INR",
      order_note: "Payment for subscription",
      customer_details: {
        customer_id: userId,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: "http://localhost:3000/payment-success",
        notify_url: "http://localhost:5000/api/payment/webhook",
      },
    };

    console.log("Cashfree orderData:", orderData);

    const url = getCashfreeUrl();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log("Cashfree response:", data);

    // ✅ NEW CHECK
    if (!data.order_id) {
      console.error("Cashfree API did not return order_id:", data);
      return res.status(500).json({ error: "Failed to create order", data });
    }

    // Save order in DB
    const payment = await prisma.payment.create({
      data: {
        userId,
        orderId: data.order_id,
        amount: Number(amount),
        currency: "INR",
        status: "PENDING",
      },
    });

    res.status(201).json({ order: data, payment });

  } catch (err) {
    console.error("Create order unexpected error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

  


// Verify Cashfree payment (after frontend callback)
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, cfPaymentId, txStatus } = req.body;

    if (!orderId || !cfPaymentId || !txStatus) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        cfPaymentId,
        status: txStatus === "SUCCESS" ? "SUCCESS" : "FAILED",
      },
    });

    res.json({ message: "Payment updated", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Cashfree webhook endpoint
export const paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (hash !== signature) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const { orderId, txStatus, referenceId } = req.body;

    await prisma.payment.update({
      where: { orderId },
      data: {
        cfPaymentId: referenceId,
        status: txStatus === "SUCCESS" ? "SUCCESS" : "FAILED",
      },
    });

    res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Webhook processing failed", details: err.message });
  }
};

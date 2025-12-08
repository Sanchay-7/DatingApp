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

    const { userId, amount, email, phone, subscriptionTier } = req.body;

    // ✅ Check required parameters
    if (!userId || amount === undefined || amount === null || !email || !phone) {
      console.error("Missing parameters:", { userId, amount, email, phone });
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // ✅ Validate amount is positive
    if (Number(amount) <= 0 || Number.isNaN(Number(amount))) {
      console.error("Invalid amount:", amount);
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // ✅ Validate environment configuration
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error("Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    // ✅ Check user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error("User not found for id:", userId);
      return res.status(400).json({ error: "User not found" });
    }

    // ✅ Premium subscription is only for men
    if (user.gender === 'Female') {
      console.error("Women cannot purchase premium subscription");
      return res.status(403).json({ 
        error: "Premium subscription is only available for men. Women get all features for free!" 
      });
    }

    // ✅ CRITICAL FIX: Generate unique order_id
    const orderId = `order_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ FIXED: Correct payload structure for Cashfree API
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const safeFrontendUrl = frontendUrl.replace(/^http:/, 'https:');
    const safeBackendUrl = backendUrl.replace(/^http:/, 'https:');

    const orderData = {
      order_id: orderId, // ⭐ REQUIRED FIELD - was missing
      order_amount: Number(amount), // Keep numeric; Cashfree accepts number
      order_currency: "INR",
      order_note: `Valise ${subscriptionTier || 'Premium'} Subscription`,
      customer_details: {
        customer_id: userId,
        customer_email: email,
        customer_phone: phone.toString(), // Ensure string format
      },
      order_meta: {
        return_url: `${safeFrontendUrl}/payment-success?order_id={order_id}`,
        notify_url: `${safeBackendUrl}/api/payment/webhook`,
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
        "x-api-version": "2025-01-01", // Cashfree v5 (2025-01-01)
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log("Cashfree response (status", response.status, "):", data);

    // ✅ Enhanced error handling
    if (!response.ok || !data.payment_session_id) {
      console.error("Cashfree API error details:", {
        status: response.status,
        statusText: response.statusText,
        fullResponse: data,
        requestData: orderData,
        credentials: {
          appId: process.env.CASHFREE_APP_ID ? "SET" : "MISSING",
          secretKey: process.env.CASHFREE_SECRET_KEY ? "SET" : "MISSING",
          env: process.env.CASHFREE_ENV || "NOT SET (defaults to sandbox)",
          url: url
        }
      });
      
      return res.status(response.status || 500).json({ 
        error: "Failed to create order", 
        message: data.message || data.error_message || "Unknown error from Cashfree",
        code: data.code || data.error_code,
        type: data.type,
        details: data
      });
    }

    // Save order in DB with the generated order_id
    const dbSubscriptionTier = (subscriptionTier || "PREMIUM") === "PREMIUM" ? "PREMIUM_MAN" : subscriptionTier;
    
    const payment = await prisma.payment.create({
      data: {
        userId,
        orderId: orderId, // ⭐ Use our generated order_id
        amount: Number(amount),
        currency: "INR",
        status: "PENDING",
        subscriptionTier: dbSubscriptionTier || "PREMIUM_MAN",
      },
    });

    // Return payment session ID for Cashfree SDK integration
    res.status(201).json({ 
      success: true,
      orderId: orderId,
      paymentSessionId: data.payment_session_id,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      payment 
    });

  } catch (err) {
    console.error("Create order unexpected error:", err);
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

  


// Verify Cashfree payment (after frontend callback)
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, cfPaymentId, txStatus } = req.body;

    console.log('Verify payment request:', { orderId, cfPaymentId, txStatus });

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId parameter" });
    }

    // Fetch payment status from Cashfree API
    const url = `${getCashfreeUrl()}/${orderId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2025-01-01",
      },
    });

    const orderData = await response.json();
    console.log('Cashfree order status:', orderData);

    // Determine payment status from Cashfree response
    const paymentStatus = orderData.order_status === 'PAID' ? 'SUCCESS' : 
                         orderData.order_status === 'ACTIVE' ? 'PENDING' : 'FAILED';

    // Update payment in database
    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        cfPaymentId: cfPaymentId || orderData.cf_order_id?.toString(),
        status: paymentStatus,
      },
    });

    // If payment is successful, create/update subscription
    if (paymentStatus === "SUCCESS" && payment.subscriptionTier) {
      const subscriptionTier = payment.subscriptionTier;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month validity

      // PREMIUM_MAN is the only subscription tier (for men)
      // Women don't need subscriptions - they get everything free
      const actualTier = subscriptionTier === 'PREMIUM_MAN' ? 'PREMIUM_MAN' : subscriptionTier;

      // Create or update subscription
      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          tier: actualTier,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
          superSwipesWeekly: 5,
          spotlightsMonthly: 1,
          unlimitedExtends: true,
          unlimitedRematch: true,
          unlimitedBacktrack: true,
        },
        create: {
          userId: payment.userId,
          tier: actualTier,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
          superSwipesWeekly: 5,
          spotlightsMonthly: 1,
          unlimitedExtends: true,
          unlimitedRematch: true,
          unlimitedBacktrack: true,
        },
      });

      // Update user subscription tier
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionTier: actualTier,
          superSwipesLeft: 5,
          spotlightsLeft: 1,
          backtrackAvailable: true,
        },
      });
    }

    res.json({ message: "Payment verified", payment, orderStatus: orderData.order_status });
  } catch (err) {
    console.error('Verify payment error:', err);
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

    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        cfPaymentId: referenceId,
        status: txStatus === "SUCCESS" ? "SUCCESS" : "FAILED",
      },
    });

    // If payment is successful, create/update subscription
    if (txStatus === "SUCCESS" && payment.subscriptionTier) {
      const subscriptionTier = payment.subscriptionTier;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month validity

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          tier: subscriptionTier,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
          superSwipesWeekly: 5,
          spotlightsMonthly: 1,
          unlimitedExtends: true,
          unlimitedRematch: true,
          unlimitedBacktrack: true,
        },
        create: {
          userId: payment.userId,
          tier: subscriptionTier,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
          superSwipesWeekly: 5,
          spotlightsMonthly: 1,
          unlimitedExtends: true,
          unlimitedRematch: true,
          unlimitedBacktrack: true,
        },
      });

      // Update user subscription tier
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionTier,
          superSwipesLeft: 5,
          spotlightsLeft: 1,
          backtrackAvailable: true,
        },
      });
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Webhook processing failed", details: err.message });
  }
};

// Diagnostic endpoint to check Cashfree configuration
export const checkPaymentConfig = async (req, res) => {
  try {
    const config = {
      cashfreeConfigured: !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
      environment: process.env.CASHFREE_ENV || "sandbox (default)",
      appIdSet: !!process.env.CASHFREE_APP_ID,
      secretKeySet: !!process.env.CASHFREE_SECRET_KEY,
      url: getCashfreeUrl(),
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
      nodeEnv: process.env.NODE_ENV || "development"
    };
    
    console.log("Payment config check:", config);
    res.status(200).json(config);
  } catch (err) {
    console.error("Config check failed:", err);
    res.status(500).json({ error: "Config check failed", details: err.message });
  }
};

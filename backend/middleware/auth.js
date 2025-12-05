import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authMiddleware = (req, res, next) => {
  try {
    console.log(`[AUTH-MIDDLEWARE] Incoming request to ${req.method} ${req.path}`);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[AUTH-MIDDLEWARE] No token provided");
      return res.status(401).json({ error: "Token not provided" });
    }

    console.log("[AUTH-MIDDLEWARE] Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate that decoded token has required fields
    if (!decoded.id) {
      console.error("[AUTH-MIDDLEWARE] Token decoded but missing id field:", decoded);
      return res.status(401).json({ error: "Invalid token format" });
    }

    req.user = decoded;
    console.log(`[AUTH-MIDDLEWARE] ✓ Authenticated user ID: ${decoded.id}`);
    
    // Update lastActive timestamp (fire and forget)
    prisma.user.update({
      where: { id: decoded.id },
      data: { lastActive: new Date() }
    }).catch(() => {}); // Silently fail if update doesn't work

    next();
  } catch (err) {
    console.error("[AUTH-MIDDLEWARE] Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Middleware to check if user account is ACTIVE (approved by admin)
export const requireActiveAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountStatus: true, selfieStatus: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Block access if account is not ACTIVE
    if (user.accountStatus === "PENDING_APPROVAL") {
      return res.status(403).json({ 
        error: "Your account is pending admin approval. Please wait for verification.",
        accountStatus: "PENDING_APPROVAL"
      });
    }

    if (user.accountStatus === "REJECTED") {
      return res.status(403).json({ 
        error: "Your account has been rejected. Please contact support.",
        accountStatus: "REJECTED"
      });
    }

    if (user.accountStatus === "BANNED") {
      return res.status(403).json({ 
        error: "Your account has been banned.",
        accountStatus: "BANNED"
      });
    }

    // Allow access only if ACTIVE
    if (user.accountStatus !== "ACTIVE") {
      return res.status(403).json({ 
        error: "Account status invalid. Please contact support.",
        accountStatus: user.accountStatus
      });
    }

    next();
  } catch (err) {
    console.error("[ACTIVE-ACCOUNT-CHECK] Error:", err.message);
    return res.status(500).json({ error: "Failed to verify account status" });
  }
};

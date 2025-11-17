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

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate that decoded token has required fields
    if (!decoded.id) {
      console.error("Token decoded but missing id field:", decoded);
      return res.status(401).json({ error: "Invalid token format" });
    }

    req.user = decoded;
    console.log("Authenticated user ID:", decoded.id);

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ error: "Authentication failed" });
  }
};

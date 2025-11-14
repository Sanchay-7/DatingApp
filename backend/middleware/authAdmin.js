import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authAdmin = async (req, res, next) => {
  let token;

  // 1. Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if it's an ADMIN and the role matches
    // Note: We check the role inside the token first for speed.
    // In your createAdmin script, we set the role to "superadmin".
    // Let's check for "superadmin" or "admin".
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
       return res.status(403).json({ error: "Not authorized, invalid role" });
    }
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return res.status(403).json({ error: "Not authorized as an admin" });
    }

    // 4. Attach admin to request and continue
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};
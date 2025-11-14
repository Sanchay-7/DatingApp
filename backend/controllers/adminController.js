import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. Create a special ADMIN token
    const token = jwt.sign(
      { id: admin.id, role: admin.role }, // Include role for security
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Shorter expiry for admins
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- User Management ---

// ✅ GET PENDING USERS
export const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        accountStatus: "PENDING_APPROVAL",
      },
      orderBy: {
        createdAt: "asc", // Show oldest first
      },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ APPROVE A USER
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
      },
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ REJECT A USER
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "REJECTED",
      },
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
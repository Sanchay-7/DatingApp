import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";

// ✅ SIGNUP — Firebase OTP verification + Save to Postgres
export const signup = async (req, res) => {
  try {
    const { firstName, email, phoneNumber, password, firebaseToken } = req.body;

    // 1️⃣ Validate input
    if (!firstName || !email || !phoneNumber || !password || !firebaseToken) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2️⃣ Verify Firebase ID Token (proves OTP verified)
    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    if (!decoded.phone_number || decoded.phone_number !== phoneNumber) {
      return res
        .status(400)
        .json({ error: "Phone number verification failed" });
    }

    // 3️⃣ Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Email or phone already exists" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user in DB
    const user = await prisma.user.create({
      data: {
        firstName,
        email,
        phoneNumber,
        password: hashedPassword,
        isVerified: true, // ✅ Firebase already verified
      },
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGIN — Normal login using email/phone + password
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // 1️⃣ Check user existence
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ User must be verified (only Firebase does verification)
    if (!user.isVerified) {
      return res.status(400).json({ error: "Phone number not verified" });
    }

    // 2️⃣ Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

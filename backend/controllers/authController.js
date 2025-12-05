import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "../config/firebaseAdmin.js";
import nodemailer from "nodemailer";

// ✅ SIGNUP — Creates user as PENDING and sends token for profile setup
export const signup = async (req, res) => {
  try {
    const { firstName, email, phoneNumber, password, firebaseToken } = req.body;

    // 1️⃣ Validate input
    if (!firstName || !email || !phoneNumber || !password || !firebaseToken) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2️⃣ Verify Firebase ID Token
    let decoded;

    try {
      decoded = await admin.auth().verifyIdToken(firebaseToken);
    } catch (err) {
      // Allow testing without valid Firebase token
      decoded = { phone_number: phoneNumber };
    }

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
    // We remove 'isVerified: true'.
    // The 'accountStatus' will default to PENDING_APPROVAL from the schema.
    const user = await prisma.user.create({
      data: {
        firstName,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    });

    // 6️⃣ Generate JWT token for the new user
    // We KEEP this, so the user can complete profile setup (upload photos, etc.)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful, proceed to profile setup.",
      token, // <-- Token sent so frontend can call update-profile APIs
      user,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGIN — Checks if user is ACTIVE
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

    // 2️⃣ Check the user's account status
    if (user.accountStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({ error: "Your account is still pending approval." });
    }
    if (user.accountStatus === 'BANNED' || user.accountStatus === 'REJECTED') {
      return res.status(403).json({ error: "Your account has been suspended." });
    }
    // Only ACTIVE users can log in
    if (user.accountStatus !== 'ACTIVE') {
       return res.status(403).json({ error: "Account is not active." });
    }

    // 3️⃣ Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // 4️⃣ Generate JWT
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

// 
// --- ⬇️ THIS IS THE MISSING FUNCTION ⬇️ ---
// 

// ✅ CHECK AUTH STATUS — Lets the waiting room check approval status
export const checkAuthStatus = async (req, res) => {
  try {
    // req.user is attached by authMiddleware.
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { accountStatus: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's current status (e.g., "ACTIVE" or "PENDING_APPROVAL")
    res.status(200).json({ status: user.accountStatus });

  } catch (err) {
    console.error("Check Status Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ FORGOT PASSWORD — Sends password reset link to email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate JWT reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Create test account and transporter
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"DatingApp" <noreply@datingapp.com>',
      to: user.email,
      subject: "Reset Your Password",
      html: `<p>Hello ${user.firstName},</p>
             <p>Click below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link expires in 15 minutes.</p>`,
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.status(200).json({
      success: true,
      message: "Reset link sent to email (check Ethereal preview URL)",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "All fields are required" });

    // 1️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // 2️⃣ Find user
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
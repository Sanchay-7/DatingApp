import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateOTP, otpExpiry } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

  // POST /api/auth/signup
  export const signup = async (req, res) => {
    try {
      const {
        firstName,
        email,
        password,
        birthday,
        gender,
        interestedIn,
        lookingFor,
        phoneNumber,
        interests = [],
        sexualOrientation = null,
        profileImage = null
      } = req.body;

      // 1️⃣ Age validation
      const birthDate = new Date(birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (
        age < 18 ||
        (age === 18 &&
          (today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() < birthDate.getDate())))
      ) {
        return res.status(400).json({ error: "User must be at least 18 years old" });
      }

      // 2️⃣ Check if email or phone already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phoneNumber }]
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email or phone number already exists" });
      }

      // 3️⃣ Hash password
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // 4️⃣ Generate OTP
      const otp = generateOTP();
      const otpExpiresAt = otpExpiry();

      let profileImageUrl = profileImage || "https://dummyimage.com/200x200/000/fff.png&text=Profile";
      if (req.file) {
        const result = await cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) throw error;
            profileImageUrl = result.secure_url;
          }
        ).end(req.file.buffer);
      }

      // 5️⃣ Create user in DB
      const newUser = await prisma.user.create({
        data: {
          firstName,
          email,
          password: hashedPassword,
          birthday: birthDate,
          gender,
          interestedIn,
          lookingFor,
          phoneNumber,
          interests,
          sexualOrientation,
          profileImage : profileImageUrl,
          otp,
          otpExpiresAt,
          isVerified: false
        }
      });

      // 6️⃣ Return response
      res.status(201).json({
        success: true,
        message: "User created. OTP sent to phone number.",
        otp // For development/testing only. In production, send via SMS API
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // 1️⃣ Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // 3️⃣ Check if OTP is expired
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // 4️⃣ Update user as verified and remove OTP
    await prisma.user.update({
      where: { phoneNumber },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null
      }
    });

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully!"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // 1️⃣ Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phoneNumber: emailOrPhone }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ error: "Phone number not verified" });
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

    // 5️⃣ Return user info + token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        interestedIn: user.interestedIn,
        lookingFor: user.lookingFor,
        profileImage: user.profileImage,
        interests: user.interests,
        sexualOrientation: user.sexualOrientation
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


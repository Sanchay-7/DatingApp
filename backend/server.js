import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables FIRST
dotenv.config();

import prisma from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ Next.js frontend
    credentials: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ message: "Connected to DB!", users });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/v1/admin", adminRoutes);

// --- THIS IS THE FIX ---
// This ensures your server listens for /api/user/* to match your frontend
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


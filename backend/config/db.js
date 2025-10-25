import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected successfully!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

connectDB();

export default prisma;

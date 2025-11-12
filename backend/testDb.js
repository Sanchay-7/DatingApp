import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing database connection...");
    
    // Check if User table exists
    const users = await prisma.user.findMany({ take: 1 });
    console.log("✅ User table exists. Found", users.length, "users");

    // Check if Conversation table exists
    const conversations = await prisma.conversation.findMany({ take: 1 });
    console.log("✅ Conversation table exists. Found", conversations.length, "conversations");

    // Check if Message table exists
    const messages = await prisma.message.findMany({ take: 1 });
    console.log("✅ Message table exists. Found", messages.length, "messages");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 'P2021') {
      console.log("This means the table does not exist in the database");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

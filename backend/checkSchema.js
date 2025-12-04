import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `;
    
    console.log("User table columns:");
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check enums
    const enums = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typname LIKE 'SubscriptionTier%'
    `;
    
    console.log("\nSubscriptionTier enums:");
    enums.forEach(e => console.log(`  ${e.typname}`));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();

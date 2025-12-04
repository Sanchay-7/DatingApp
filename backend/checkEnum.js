import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkEnumValues() {
  try {
    const result = await prisma.$queryRaw`
      SELECT e.enumlabel 
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'SubscriptionTier'
      ORDER BY e.enumsortorder
    `;
    
    console.log("SubscriptionTier enum values:");
    result.forEach(row => {
      console.log(`  - ${row.enumlabel}`);
    });

    // Check user tier distribution
    const tierDist = await prisma.$queryRaw`
      SELECT "subscriptionTier", COUNT(*) as count
      FROM "User"
      GROUP BY "subscriptionTier"
    `;

    console.log("\nUser subscription tier distribution:");
    tierDist.forEach(row => {
      console.log(`  ${row.subscriptionTier}: ${row.count}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnumValues();

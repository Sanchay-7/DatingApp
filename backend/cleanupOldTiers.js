import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupOldTiers() {
  try {
    console.log("Cleaning up old subscription tier values...");

    // First, get users with old tiers using raw SQL
    const usersWithOldTiers = await prisma.$queryRaw`
      SELECT id, gender
      FROM "User"
      WHERE "subscriptionTier" NOT IN ('FREE', 'PREMIUM_MAN', 'PREMIUM_WOMAN')
    `;

    console.log(`Found ${usersWithOldTiers.length} users with old tier values`);

    for (const user of usersWithOldTiers) {
      const newTier = user.gender === 'Male' ? 'PREMIUM_MAN' : 'PREMIUM_WOMAN';
      console.log(`Converting user ${user.id} (${user.gender}) to ${newTier}`);
      
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "subscriptionTier" = $1 WHERE id = $2`,
        newTier,
        user.id
      );
    }

    console.log("✅ Old tier values cleaned up!");

    // Show distribution
    const tierDist = await prisma.$queryRaw`
      SELECT "subscriptionTier", COUNT(*) as count
      FROM "User"
      GROUP BY "subscriptionTier"
    `;

    console.log("\nFinal user subscription tier distribution:");
    tierDist.forEach(row => {
      console.log(`  ${row.subscriptionTier}: ${row.count}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldTiers();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupAndUpdateEnum() {
  try {
    console.log("Cleaning up and updating SubscriptionTier enum...");

    // Try to drop the old enum if it exists
    try {
      console.log("Dropping old enum if exists...");
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "SubscriptionTier_old" CASCADE;`);
    } catch (e) {
      console.log("Old enum didn't exist or couldn't be dropped");
    }

    // Now proceed with the update
    console.log("Dropping default constraint on User.subscriptionTier...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
    `);

    console.log("Dropping default constraint on Subscription.tier...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" DROP DEFAULT;
    `);

    console.log("Renaming old enum...");
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
    `);

    console.log("Creating new enum...");
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM_MAN', 'PREMIUM_WOMAN');
    `);

    console.log("Updating User table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier" USING "subscriptionTier"::text::"SubscriptionTier";
    `);

    console.log("Updating Subscription table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" TYPE "SubscriptionTier" USING "tier"::text::"SubscriptionTier";
    `);

    console.log("Re-adding defaults...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE'::"SubscriptionTier";
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" SET DEFAULT 'FREE'::"SubscriptionTier";
    `);

    console.log("Dropping old enum...");
    await prisma.$executeRawUnsafe(`
      DROP TYPE "SubscriptionTier_old";
    `);

    console.log("✅ Enum updated successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndUpdateEnum();

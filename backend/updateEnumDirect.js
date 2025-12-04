import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateEnum() {
  try {
    console.log("Updating SubscriptionTier enum in PostgreSQL...");

    // Step 1: Drop the default constraint on User.subscriptionTier
    console.log("Dropping default constraint on User.subscriptionTier...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
    `);

    // Step 2: Drop the default constraint on Subscription.tier
    console.log("Dropping default constraint on Subscription.tier...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" DROP DEFAULT;
    `);

    // Step 3: Rename the old enum
    console.log("Renaming old enum...");
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
    `);

    // Step 4: Create new enum with correct values
    console.log("Creating new enum...");
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM_MAN', 'PREMIUM_WOMAN');
    `);

    // Step 5: Update the column type in the User table
    console.log("Updating User table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier" USING "subscriptionTier"::text::"SubscriptionTier";
    `);

    // Step 6: Update the column type in the Subscription table
    console.log("Updating Subscription table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" TYPE "SubscriptionTier" USING "tier"::text::"SubscriptionTier";
    `);

    // Step 7: Set the defaults back
    console.log("Re-adding defaults...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE'::"SubscriptionTier";
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ALTER COLUMN "tier" SET DEFAULT 'FREE'::"SubscriptionTier";
    `);

    // Step 8: Drop the old enum type
    console.log("Dropping old enum...");
    await prisma.$executeRawUnsafe(`
      DROP TYPE "SubscriptionTier_old";
    `);

    console.log("✅ Enum updated successfully!");
  } catch (error) {
    console.error("Error updating enum:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateEnum();

import prisma from "./config/db.js";

async function migrateSubscriptionTiers() {
  try {
    console.log("Starting subscription tier migration...");

    // Get all users with PREMIUM or BOOST tiers
    const users = await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: ["PREMIUM", "BOOST"],
        },
      },
      select: {
        id: true,
        gender: true,
        subscriptionTier: true,
      },
    });

    console.log(`Found ${users.length} users to migrate`);

    let premiumManCount = 0;
    let premiumWomanCount = 0;

    // Update each user based on their gender
    for (const user of users) {
      let newTier;

      // BOOST users become PREMIUM_MAN (or PREMIUM_WOMAN if they're women, though unlikely)
      // PREMIUM users become PREMIUM_MAN or PREMIUM_WOMAN based on gender
      if (user.subscriptionTier === "PREMIUM") {
        newTier = user.gender === "Male" ? "PREMIUM_MAN" : "PREMIUM_WOMAN";
      } else if (user.subscriptionTier === "BOOST") {
        // BOOST users (if any) also get mapped to gender-based tier
        newTier = user.gender === "Male" ? "PREMIUM_MAN" : "PREMIUM_WOMAN";
      }

      if (newTier) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionTier: newTier },
        });

        if (newTier === "PREMIUM_MAN") {
          premiumManCount++;
        } else if (newTier === "PREMIUM_WOMAN") {
          premiumWomanCount++;
        }
        console.log(`✓ Migrated ${user.id} from ${user.subscriptionTier} to ${newTier}`);
      }
    }

    // Also update subscriptions table
    const subscriptions = await prisma.subscription.findMany({
      where: {
        tier: {
          in: ["PREMIUM", "BOOST"],
        },
      },
      select: {
        userId: true,
        tier: true,
      },
    });

    console.log(`\nFound ${subscriptions.length} subscriptions to migrate`);

    for (const sub of subscriptions) {
      // Get user gender to determine new tier
      const user = await prisma.user.findUnique({
        where: { id: sub.userId },
        select: { gender: true },
      });

      let newTier;
      if (sub.tier === "PREMIUM") {
        newTier = user?.gender === "Male" ? "PREMIUM_MAN" : "PREMIUM_WOMAN";
      } else if (sub.tier === "BOOST") {
        newTier = user?.gender === "Male" ? "PREMIUM_MAN" : "PREMIUM_WOMAN";
      }

      if (newTier) {
        await prisma.subscription.update({
          where: { userId: sub.userId },
          data: { tier: newTier },
        });
        console.log(`✓ Migrated subscription for ${sub.userId} from ${sub.tier} to ${newTier}`);
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log(`Total PREMIUM_MAN: ${premiumManCount}`);
    console.log(`Total PREMIUM_WOMAN: ${premiumWomanCount}`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSubscriptionTiers();

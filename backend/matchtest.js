import prisma from "./config/db.js";

async function testMatch() {
  console.log("✅ Connecting to PostgreSQL...");

  const currentUser = await prisma.user.findUnique({
    where: { id: "4d9c2e57-6c2c-4203-a071-65f3b319340b" },
    select: { id: true, name: true, gender: true, preferences: true },
  });

  if (!currentUser) {
    console.error("❌ Current user not found!");
    return;
  }

  currentUser.preferences =
    typeof currentUser.preferences === "string"
      ? JSON.parse(currentUser.preferences)
      : currentUser.preferences || {};

  const normalize = (val = "") => val.trim().toLowerCase();

  // 🔧 Gender singular/plural map
  const genderMap = {
    man: "men",
    men: "men",
    woman: "women",
    women: "women",
  };

  const normalizeGender = (g) => genderMap[normalize(g)] || normalize(g);

  console.log("👤 Current User:", {
    name: currentUser.name,
    gender: currentUser.gender,
    preferences: currentUser.preferences,
  });

  const others = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { id: true, name: true, gender: true, preferences: true },
  });

  const parsedOthers = others.map((user) => ({
    ...user,
    preferences:
      typeof user.preferences === "string"
        ? JSON.parse(user.preferences)
        : user.preferences || {},
  }));

  console.log(`\n📋 Found ${parsedOthers.length} potential matches.`);

  const matches = parsedOthers.filter((p) => {
    const userPrefs = p.preferences || {};
    const currentPrefs = currentUser.preferences || {};

    const currentGender = normalizeGender(currentUser.gender);
    const partnerGender = normalizeGender(p.gender);

    const interestedInCurrent = (userPrefs.interestedIn || []).map(normalizeGender);
    const interestedInPartner = (currentPrefs.interestedIn || []).map(normalizeGender);

    const genderMatch =
      interestedInCurrent.includes(currentGender) &&
      interestedInPartner.includes(partnerGender);

    const intentMatch =
      normalize(userPrefs.relationshipIntent) ===
      normalize(currentPrefs.relationshipIntent);

    const orientationMatch =
      normalize(userPrefs.sexualOrientation) ===
      normalize(currentPrefs.sexualOrientation);

    const mutual = genderMatch && intentMatch && orientationMatch;

    if (mutual) {
      console.log(`💘 Match found between ${currentUser.name} ↔ ${p.name}`);
    }

    return mutual;
  });

  if (matches.length === 0)
    console.log("\n🚫 No matches found. Check preference alignment or gender labels.");
  else console.log("\n✅ Final Matched Profiles:", matches.map((m) => m.name));
}

testMatch()
  .catch((err) => console.error("❌ Error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 PostgreSQL disconnected.");
  });

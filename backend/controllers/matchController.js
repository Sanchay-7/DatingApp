import prisma from "../config/db.js";

export const getProfiles = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    console.log("🔍 Authenticated user ID:", userId);

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, gender: true, preferences: true },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.preferences =
      typeof currentUser.preferences === "string"
        ? JSON.parse(currentUser.preferences)
        : currentUser.preferences || {};

    const normalize = (val = "") => val.trim().toLowerCase();

    const genderMap = {
      man: "men",
      men: "men",
      woman: "women",
      women: "women",
    };
    const normalizeGender = (g) => genderMap[normalize(g)] || normalize(g);

    const allProfiles = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: {
        id: true,
        name: true,
        gender: true,
        birthday: true,
        work: true,
        height: true,
        hometown: true,
        currentLocation: true,
        photos: true,
        preferences: true,
      },
    });

    const parsedProfiles = allProfiles.map((p) => ({
      ...p,
      preferences:
        typeof p.preferences === "string"
          ? JSON.parse(p.preferences)
          : p.preferences || {},
    }));

    const matches = parsedProfiles.filter((p) => {
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

      if (mutual)
        console.log(`💘 Match found between ${currentUser.name} ↔ ${p.name}`);

      return mutual;
    });

    return res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
      profiles: matches,
    });
  } catch (err) {
    console.error("❌ Get profiles error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    await prisma.$disconnect();
    console.log("🔌 PostgreSQL disconnected.");
  }
};

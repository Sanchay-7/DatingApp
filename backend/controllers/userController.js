import prisma from "../config/db.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      birthday,
      gender,
      work,
      height,
      hometown,
      currentLocation,
      photos,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        birthday: birthday ? new Date(birthday) : undefined,
        gender,
        work,
        height: height ? Number(height) : undefined,
        hometown,
        currentLocation,
        photos,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      interestedIn,
      relationshipIntent,
      sexualOrientation,
      interests,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          interestedIn,
          relationshipIntent,
          sexualOrientation,
          interests,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // JWT decoded user ID

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
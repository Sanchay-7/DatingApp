import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// Upload single image to Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    // ... [your existing upload logic, it's fine] ...
    const base64Image = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
    const uploadOptions = {
      folder: "valise-profiles",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
      ],
    };
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error("❌ Upload image error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    // ✅ FIX: Removed the extra dot from req.user.id
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (birthday) updateData.birthday = new Date(birthday);
    if (gender !== undefined) updateData.gender = gender;
    if (work !== undefined) updateData.work = work;
    if (height !== undefined) updateData.height = parseInt(height) || null;
    if (hometown !== undefined) updateData.hometown = hometown;
    if (currentLocation !== undefined)
      updateData.currentLocation = currentLocation;
    if (photos !== undefined) updateData.photos = photos;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

// Update Preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interestedIn, relationshipIntent, sexualOrientation, interests } =
      req.body;

    const preferencesData = {};
    if (interestedIn !== undefined)
      preferencesData.interestedIn = interestedIn;
    if (relationshipIntent !== undefined)
      preferencesData.relationshipIntent = relationshipIntent;
    if (sexualOrientation !== undefined)
      preferencesData.sexualOrientation = sexualOrientation;
    if (interests !== undefined) preferencesData.interests = interests;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: preferencesData,
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

// ✅ FIX: Added the missing getMyProfile function
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

/*
 * =======================================================
 * CONTROLLER: getDiscoverUsers (✅ SIMPLE FIX)
 * We will REMOVE all preference filtering.
 * =======================================================
 */
export const getDiscoverUsers = async (req, res) => {
  try {
    // 1. Get the logged-in user's ID
    const loggedInUserId = req.user.id;

    // 2. Find IDs of users already swiped
    const swipedUsers = await prisma.interactions.findMany({
      where: { swiperId: loggedInUserId },
      select: { swipedId: true },
    });
    const swipedUserIds = swipedUsers.map((u) => u.swipedId);

    // 3. Find new users to show (NO GENDER/PREFERENCE FILTERING)
    const usersToDiscover = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: loggedInUserId } }, // Not ourself
          { id: { notIn: swipedUserIds } }, // Not anyone we already swiped
        ],
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        work: true,
        photos: true,
        currentLocation: true,
        birthday: true,
      },
    });

    res.status(200).json({ success: true, users: usersToDiscover });
  } catch (error) {
    console.error("Error in getDiscoverUsers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/*
 * =======================================================
 * CONTROLLER: likeUser
 * =======================================================
 */
export const likeUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  const { swipedUserId } = req.body;

  if (!swipedUserId) {
    return res.status(400).json({ message: "swipedUserId is required" });
  }

  try {
    await prisma.interactions.create({
      data: {
        swiperId: loggedInUserId,
        swipedId: swipedUserId,
        action: "like",
      },
    });

    const otherUserLikedYou = await prisma.interactions.findFirst({
      where: {
        swiperId: swipedUserId,
        swipedId: loggedInUserId,
        action: "like",
      },
    });

    if (otherUserLikedYou) {
      return res
        .status(201)
        .json({ success: true, message: "User liked", match: true });
    }

    res.status(201).json({ success: true, message: "User liked", match: false });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "User already swiped" });
    }
    console.error("Error in likeUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/*
 * =======================================================
 * CONTROLLER: skipUser
 * =======================================================
 */
export const skipUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  const { swipedUserId } = req.body;

  if (!swipedUserId) {
    return res.status(400).json({ message: "swipedUserId is required" });
  }

  try {
    await prisma.interactions.create({
      data: {
        swiperId: loggedInUserId,
        swipedId: swipedUserId,
        action: "skip",
      },
    });
    res.status(201).json({ success: true, message: "User skipped" });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "User already swiped" });
    }
    console.error("Error in skipUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
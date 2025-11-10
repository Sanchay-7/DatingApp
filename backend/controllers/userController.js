import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

// Upload single image to Cloudinary
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file in request");
      return res.status(400).json({ error: "No file provided" });
    }

    console.log("Upload request received:", {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
    });

    // Validate file type
    if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image" });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: "File size must be less than 10MB" });
    }

    // Validate buffer exists
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: "File buffer is empty" });
    }

    console.log("Preparing to upload to Cloudinary...");
    console.log("Cloudinary config check:", {
      hasConfig: !!cloudinary.config().cloud_name,
      cloudName: cloudinary.config().cloud_name,
    });

    // Convert buffer to base64 for Cloudinary
    const base64Image = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    console.log("Uploading to Cloudinary (size:", Math.round(dataURI.length / 1024), "KB)...");

    // Upload to Cloudinary
    const uploadOptions = {
      folder: "valise-profiles",
      resource_type: "auto", // Let Cloudinary detect the type
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1000, height: 1000, crop: "limit" }, // Resize large images
        { quality: "auto" }, // Optimize quality
      ],
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    console.log("✅ Upload successful:", result.secure_url);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error("❌ Upload image error:", err);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      http_code: err.http_code,
      error: err.error,
      stack: err.stack?.split("\n").slice(0, 5).join("\n"),
    });
    
    // Return more specific error message
    let errorMessage = "Failed to upload image";
    
    if (err.http_code) {
      // Cloudinary specific error
      errorMessage = `Cloudinary error (${err.http_code}): ${err.message || "Upload failed"}`;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    // Check for common issues
    if (err.message?.includes("Invalid api_key") || err.message?.includes("authentication")) {
      errorMessage = "Cloudinary authentication failed. Please check your API credentials.";
    } else if (err.message?.includes("cloud_name")) {
      errorMessage = "Cloudinary cloud name not configured. Please check your .env file.";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Update profile - User ID from token:", userId);
    console.log("Update profile - Full req.user:", req.user);

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      console.error("User not found in database. User ID:", userId);
      console.error("Token payload:", req.user);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", existingUser.email);

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

    console.log("Received profile update request for user:", userId);
    console.log("Request body:", req.body);

    // Prepare update data
    const updateData = {};

    if (name !== undefined && name !== null) updateData.name = name;
    if (birthday) {
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: "Invalid birthday format" });
      }
      updateData.birthday = birthDate;
    }
    if (gender !== undefined && gender !== null) updateData.gender = gender;
    if (work !== undefined) updateData.work = work || null;
    if (height !== undefined) {
      if (height !== null && height !== "") {
        const heightNum = parseInt(height);
        if (isNaN(heightNum)) {
          return res.status(400).json({ error: "Invalid height value" });
        }
        updateData.height = heightNum;
      } else {
        updateData.height = null;
      }
    }
    if (hometown !== undefined) updateData.hometown = hometown || null;
    if (currentLocation !== undefined) updateData.currentLocation = currentLocation || null;
    if (photos !== undefined) {
      // Ensure photos is an array for JSON field
      updateData.photos = Array.isArray(photos) ? photos : null;
    }

    console.log("Update data:", updateData);

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
    console.error("Error stack:", err.stack);
    // Return more specific error message
    const errorMessage = err.message || "Server error";
    res.status(500).json({ error: errorMessage });
  }
};


export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      interestedIn,
      relationshipIntent,
      sexualOrientation,
      interests,
    } = req.body;

    console.log("Received preferences update request for user:", userId);
    console.log("Request body:", req.body);

    // Prepare preferences object
    const preferencesData = {};
    
    if (interestedIn !== undefined) {
      preferencesData.interestedIn = Array.isArray(interestedIn) ? interestedIn : [];
    }
    if (relationshipIntent !== undefined) {
      preferencesData.relationshipIntent = relationshipIntent || null;
    }
    if (sexualOrientation !== undefined) {
      preferencesData.sexualOrientation = sexualOrientation || null;
    }
    if (interests !== undefined) {
      preferencesData.interests = Array.isArray(interests) ? interests : [];
    }

    console.log("Preferences data:", preferencesData);

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
    console.error("Error stack:", err.stack);
    // Return more specific error message
    const errorMessage = err.message || "Server error";
    res.status(500).json({ error: errorMessage });
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

/*
 * =======================================================
 * CONTROLLER: getDiscoverUsers
 * Gets a list of users for the logged-in user to swipe
 * =======================================================
 */
export const getDiscoverUsers = async (req, res) => {
  try {
    // 1. Get the logged-in user's ID from the authMiddleware
    const loggedInUserId = req.user.id;

    // 2. Find IDs of users already swiped
    const swipedUsers = await prisma.interactions.findMany({
      where: { swiperId: loggedInUserId },
      select: { swipedId: true },
    });
    const swipedUserIds = swipedUsers.map(u => u.swipedId);

    // 3. Find new users to show
    const usersToDiscover = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: loggedInUserId } },    // Not ourself
          { id: { notIn: swipedUserIds } }, // Not anyone we already swiped
        ],
        // TODO: Add preference filtering (e.g., gender)
        // gender: req.user.preferences.interestedIn 
      },
      take: 10, // Get 10 users at a time
      select: {
        // Only send the data the frontend needs
        id: true,
        firstName: true,
        work: true,
        photos: true,
        currentLocation: true,
        birthday: true,
      }
    });

    res.status(200).json({ success: true, users: usersToDiscover });

  } catch (error) {
    console.error("Error in getDiscoverUsers:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


/*
 * =======================================================
 * CONTROLLER: likeUser
 * Records a 'like' action and checks for a match
 * =======================================================
 */
export const likeUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  const { swipedUserId } = req.body;

  if (!swipedUserId) {
    return res.status(400).json({ message: "swipedUserId is required" });
  }

  try {
    // 1. Create the 'like' interaction
    await prisma.interactions.create({
      data: {
        swiperId: loggedInUserId,
        swipedId: swipedUserId,
        action: 'like',
      },
    });

    // 2. Check for a match
    const otherUserLikedYou = await prisma.interactions.findFirst({
      where: {
        swiperId: swipedUserId, // The person *you* liked
        swipedId: loggedInUserId, // *liked you*
        action: 'like',
      }
    });

    if (otherUserLikedYou) {
      // IT'S A MATCH!
      // TODO: Create a 'Match' record in a new 'Matches' table
      return res.status(201).json({ success: true, message: 'User liked', match: true });
    }

    // No match yet
    res.status(201).json({ success: true, message: 'User liked', match: false });

  } catch (error) {
    // Handle case where user already swiped (unique constraint error)
    if (error.code === 'P2002') { 
        return res.status(409).json({ success: false, message: "User already swiped" });
    }
    console.error("Error in likeUser:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


/*
 * =======================================================
 * CONTROLLER: skipUser
 * Records a 'skip' action
 * =======================================================
 */
export const skipUser = async (req, res) => {
  const loggedInUserId = req.user.id;
  const { swipedUserId } = req.body;

  if (!swipedUserId) {
    return res.status(400).json({ message: "swipedUserId is required" });
  }

  try {
    // Create the 'skip' interaction
    await prisma.interactions.create({
      data: {
        swiperId: loggedInUserId,
        swipedId: swipedUserId,
        action: 'skip',
      },
    });

    res.status(201).json({ success: true, message: 'User skipped' });
  
  } catch (error) {
    if (error.code === 'P2002') { 
        return res.status(409).json({ success: false, message: "User already swiped" });
    }
    console.error("Error in skipUser:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
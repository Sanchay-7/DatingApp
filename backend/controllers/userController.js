import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

const DEFAULT_SETTINGS = {
  maxDistance: 50,
  minAge: 20,
  maxAge: 35,
  showMe: true,
  newMatchNotify: true,
};

const DISLIKE_DURATION_DAYS = Number(
  process.env.RECOMMENDATION_DISLIKE_DAYS || 3
);

const INTEREST_TO_GENDER = {
  Men: "Man",
  Women: "Woman",
};

const GENDER_TO_INTEREST = {
  Man: "Men",
  Woman: "Women",
};

const DEFAULT_GENDER_POOL = ["Man", "Woman", "More"];

const clone = (value) =>
  value && typeof value === "object"
    ? JSON.parse(JSON.stringify(value))
    : {};

const toArray = (value) => (Array.isArray(value) ? value : []);

const parsePreferences = (prefs) => clone(prefs);

const calculateAge = (birthday) => {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return null;
  const diffMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const interestMatchesGender = (interestList, gender) => {
  const interestedIn = toArray(interestList).filter(Boolean);
  if (interestedIn.length === 0) return true;
  if (interestedIn.includes("Everyone")) return true;
  const genderToken = GENDER_TO_INTEREST[gender] || gender;
  if (!genderToken) return true;
  return interestedIn.includes(genderToken);
};

const mapInterestsToGenders = (interestList) => {
  const interestedIn = toArray(interestList).filter(Boolean);
  if (interestedIn.length === 0 || interestedIn.includes("Everyone")) {
    return null;
  }
  const mapped = interestedIn
    .map((value) => INTEREST_TO_GENDER[value] || null)
    .filter(Boolean);
  return mapped.length > 0 ? mapped : null;
};

const formatRecommendationProfile = (candidate) => {
  const prefs = parsePreferences(candidate.preferences);
  const photos = toArray(candidate.photos);

  return {
    id: candidate.id,
    name: candidate.name || candidate.firstName || "Valise Member",
    gender: candidate.gender,
    age: calculateAge(candidate.birthday),
    birthday: candidate.birthday,
    distance: candidate.currentLocation || "Nearby",
    job: candidate.work || "",
    mainPhoto: photos[0] || null,
    extraPhotos: photos.slice(1),
    tags: toArray(prefs.interests),
    bio: prefs.bio || "",
  };
};


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
    const {
      interestedIn,
      relationshipIntent,
      sexualOrientation,
      interests,
      bio,
      settings,
      likes,
      matches,
    } = req.body;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferencesData = parsePreferences(existing?.preferences);
    if (interestedIn !== undefined)
      preferencesData.interestedIn = interestedIn;
    if (relationshipIntent !== undefined)
      preferencesData.relationshipIntent = relationshipIntent;
    if (sexualOrientation !== undefined)
      preferencesData.sexualOrientation = sexualOrientation;
    if (interests !== undefined) preferencesData.interests = interests;
    if (bio !== undefined) preferencesData.bio = bio;
    if (settings !== undefined)
      preferencesData.settings = {
        ...DEFAULT_SETTINGS,
        ...(preferencesData.settings || {}),
        ...settings,
      };
    if (likes !== undefined) preferencesData.likes = likes;
    if (matches !== undefined) preferencesData.matches = matches;

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

export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const prefs = parsePreferences(user?.preferences);
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(prefs.settings || {}),
    };

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error("Get Settings Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const likes = await prisma.like.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            birthday: true,
            photos: true,
            preferences: true,
            lastActive: true,
          },
        },
      },
    });

    const formatted = likes.map((entry) => {
      const liker = entry.fromUser;
      const prefs = parsePreferences(liker.preferences);
      const photos = toArray(liker.photos);
      const isOnline = liker.lastActive && (new Date() - new Date(liker.lastActive)) < 5 * 60 * 1000; // Online if active within 5 minutes
      return {
        id: entry.id,
        userId: liker.id,
        name: liker.name || liker.firstName || "Valise Member",
        age: calculateAge(liker.birthday),
        imageUrl: photos[0] || null,
        interests: toArray(prefs.interests),
        likedAt: entry.createdAt,
        isOnline,
        lastActive: liker.lastActive,
      };
    });

    return res.status(200).json({
      success: true,
      likes: formatted,
    });
  } catch (err) {
    console.error("Get Likes Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gender: true,
        preferences: true,
        currentLocation: true,
        likesSent: {
          select: { toUserId: true },
        },
        accountStatus: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ error: "Account not active." });
    }

    const prefs = parsePreferences(currentUser.preferences);
    const interestedIn = toArray(prefs.interestedIn).filter(Boolean);

    if (!currentUser.gender) {
      return res.status(200).json({
        success: true,
        matches: [],
      });
    }

    const targetGenders = mapInterestsToGenders(interestedIn);
    const viewerShowsEveryone = !targetGenders;

    const now = new Date();
    const dislikedEntries = toArray(prefs.dislikedProfiles).filter(
      (entry) => entry && entry.userId
    );

    const activeDislikes = dislikedEntries.filter((entry) => {
      if (!entry.expiresAt) return false;
      const expiresAt = new Date(entry.expiresAt);
      return !Number.isNaN(expiresAt.getTime()) && expiresAt > now;
    });

    const dislikedIds = new Set(
      activeDislikes.map((entry) => entry.userId).filter(Boolean)
    );

    if (activeDislikes.length !== dislikedEntries.length) {
      const updatedPrefs = {
        ...prefs,
        dislikedProfiles: activeDislikes,
      };
      await prisma.user.update({
        where: { id: userId },
        data: { preferences: updatedPrefs },
      });
    }

    const likedUserIds = new Set(
      toArray(currentUser.likesSent).map((entry) => entry?.toUserId).filter(Boolean)
    );

    const candidateWhere = {
      id: { not: userId },
      accountStatus: "ACTIVE",
    }

    if (!viewerShowsEveryone) {
      candidateWhere.gender = { in: targetGenders };
    }

    if (likedUserIds.size > 0) {
      candidateWhere.id = {
        notIn: Array.from(likedUserIds),
        not: userId,
      };
    }

    const candidates = await prisma.user.findMany({
      where: candidateWhere,
      select: {
        id: true,
        firstName: true,
        name: true,
        gender: true,
        birthday: true,
        currentLocation: true,
        work: true,
        photos: true,
        preferences: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    // Helper: parse "lat,lng" string into numeric tuple
    const parseCoords = (loc) => {
      if (!loc || typeof loc !== 'string') return null;
      const parts = loc.split(',');
      if (parts.length !== 2) return null;
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return { lat, lng };
    };

    // Helper: haversine distance in km
    const haversineKm = (a, b) => {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius km
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
      return R * c;
    };

    const viewerCoords = parseCoords(currentUser.currentLocation);
    const maxDistanceKm = Number(parsePreferences(currentUser.preferences)?.settings?.maxDistance) || DEFAULT_SETTINGS.maxDistance;

    const recommendations = candidates
      .filter((candidate) => !dislikedIds.has(candidate.id))
      .filter((candidate) => !likedUserIds.has(candidate.id))
      .filter((candidate) => {
        const candidatePrefs = parsePreferences(candidate.preferences);
        return interestMatchesGender(
          candidatePrefs.interestedIn,
          currentUser.gender
        );
      })
      .filter((candidate) => {
        // Distance filter only if both have coordinates
        if (!viewerCoords) return true;
        const candidateCoords = parseCoords(candidate.currentLocation);
        if (!candidateCoords) return true;
        const d = haversineKm(viewerCoords, candidateCoords);
        return d <= maxDistanceKm;
      })
      .map(formatRecommendationProfile);

    return res.status(200).json({
      success: true,
      matches: recommendations,
    });
  } catch (err) {
    console.error("Get Dashboard Data Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const recordDislike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    if (targetUserId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot dislike your own profile" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    // Delete any existing like from the target user to the current user
    // This ensures rejected users disappear from the "Who Likes You" page
    await prisma.like.deleteMany({
      where: {
        fromUserId: targetUserId,
        toUserId: userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const prefs = parsePreferences(user?.preferences);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + DISLIKE_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    const existingDislikes = toArray(prefs.dislikedProfiles).filter((entry) => {
      if (!entry || !entry.userId) return false;
      if (entry.userId === targetUserId) return false;
      if (!entry.expiresAt) return false;
      const entryExpiry = new Date(entry.expiresAt);
      return !Number.isNaN(entryExpiry.getTime()) && entryExpiry > now;
    });

    existingDislikes.push({
      userId: targetUserId,
      expiresAt: expiresAt.toISOString(),
    });

    prefs.dislikedProfiles = existingDislikes;

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs },
    });

    return res.status(200).json({
      success: true,
      message: "Profile hidden from recommendations",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Record dislike error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ DELETE ACCOUNT — Permanently deletes user and all associated data
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required for account deletion" });
    }

    // Fetch user to verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const bcrypt = await import("bcryptjs");
    const validPassword = await bcrypt.default.compare(password, user.password);
    if (!validPassword) {
      return res.status(403).json({ error: "Invalid password" });
    }

    // Delete all related data
    // Delete messages from conversations
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { conversation: { participants: { some: { userId } } } },
        ],
      },
    });

    // Delete conversation participants
    await prisma.conversationParticipant.deleteMany({
      where: { userId },
    });

    // Delete conversations where user is the only participant (cleanup)
    const orphanedConvos = await prisma.conversation.findMany({
      where: {
        participants: { none: {} },
      },
    });
    if (orphanedConvos.length > 0) {
      await prisma.conversation.deleteMany({
        where: { id: { in: orphanedConvos.map((c) => c.id) } },
      });
    }

    // Delete likes sent and received
    await prisma.like.deleteMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Delete Account Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const recordLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    if (targetUserId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot like your own profile" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        fromUserId: userId,
        toUserId: targetUserId,
      },
    });

    if (existingLike) {
      return res.status(200).json({
        success: true,
        message: "Like already recorded",
        likeId: existingLike.id,
      });
    }

    const like = await prisma.like.create({
      data: {
        fromUserId: userId,
        toUserId: targetUserId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Profile liked successfully",
      likeId: like.id,
    });
  } catch (err) {
    console.error("Record like error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ REPORT USER — Report a profile as fake/inappropriate
export const reportUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportedUserId, reason } = req.body;

    console.log(`[REPORT] User ${userId} reporting user ${reportedUserId} for: ${reason}`);

    if (!reportedUserId) {
      return res.status(400).json({ error: "reportedUserId is required" });
    }

    if (!reason) {
      return res.status(400).json({ error: "reason is required" });
    }

    if (reportedUserId === userId) {
      return res.status(400).json({ error: "You cannot report your own profile" });
    }

    // Verify reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { id: true, accountStatus: true },
    });

    if (!reportedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a report record (store in preferences as an array)
    const reporterUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const prefs = parsePreferences(reporterUser?.preferences);
    
    // Initialize reports array if it doesn't exist
    if (!prefs.reports) {
      prefs.reports = [];
    }

    // Check if user already reported this profile
    const alreadyReported = prefs.reports.some(r => r.reportedUserId === reportedUserId);
    if (alreadyReported) {
      console.log(`[REPORT] User ${userId} already reported ${reportedUserId}`);
      return res.status(200).json({
        success: true,
        message: "You have already reported this user"
      });
    }

    // Add new report
    prefs.reports.push({
      reportedUserId,
      reason,
      reportedAt: new Date().toISOString(),
    });

    // Update reporter preferences (keep local record for UX/history)
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs },
    });

    // Create a Report record in the DB (Report.status defaults to PENDING)
    // First, ensure we don't already have a pending report from this reporter for this user
    const existingDbReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        reportedUserId,
        status: 'PENDING',
      },
    });

    if (!existingDbReport) {
      const newReport = await prisma.report.create({
        data: {
          reason,
          reporterId: userId,
          reportedUserId,
        },
      });
      console.log(`[REPORT] Created Report record: ${newReport.id}`);
    } else {
      console.log(`[REPORT] Report already exists in DB for ${userId} -> ${reportedUserId}`);
    }

    console.log(`[REPORT] Success: Report submitted for user ${reportedUserId}`);
    return res.status(201).json({
      success: true,
      message: "Report submitted successfully. The account has been flagged for moderation.",
    });
  } catch (err) {
    console.error("Report user error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update current geolocation (expects lat,lng numbers)
export const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat and lng must be numbers' });
    }
    const locString = `${lat},${lng}`;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { currentLocation: locString },
    });
    return res.status(200).json({ success: true, location: updated.currentLocation });
  } catch (err) {
    console.error('Update location error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
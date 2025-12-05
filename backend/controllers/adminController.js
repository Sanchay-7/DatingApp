import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. Create a special ADMIN token
    const token = jwt.sign(
      { id: admin.id, role: admin.role }, // Include role for security
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Shorter expiry for admins
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --- User Management ---

// ✅ GET PENDING USERS
export const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        accountStatus: "PENDING_APPROVAL",
      },
      orderBy: {
        createdAt: "asc", // Show oldest first
      },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ APPROVE A USER
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Fetch user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        selfiePhoto: true, // 👈 correct field
        photos: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Validate selfie exists
    if (!user.selfiePhoto) {
      return res
        .status(400)
        .json({ error: "User has not uploaded a selfie yet" });
    }

    // 3️⃣ Validate profile photos exist
    if (!user.photos || user.photos.length === 0) {
      return res
        .status(400)
        .json({ error: "User has not uploaded profile photos" });
    }

    // 4️⃣ Approve user + mark selfie as approved
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        selfieStatus: "APPROVED", // 👈 use enum/string status
        verificationAt: new Date(), // 👈 timestamp when verified
        isVerified: true, // 👈 optional but consistent
        // reset limits (optional, but valid fields in your schema)
        dailyLikesUsed: 0,
        dailyLikesResetAt: new Date(),
        dailyBacktracksUsed: 0,
        dailyBacktracksResetAt: new Date(),
      },
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Approve user error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};




// ✅ REJECT A USER
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "REJECTED",
      },
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ADMIN ANALYTICS
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Active users: updatedAt or createdAt since start of today
    const activeUsers = await prisma.user.count({
      where: {
        OR: [{ updatedAt: { gte: todayStart } }, { createdAt: { gte: todayStart } }],
      },
    });

    // New signups last 24 hours
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newSignups = await prisma.user.count({
      where: { createdAt: { gte: yesterday } },
    });

    // Total swipes (likes) last 24 hours
    const totalSwipes = await prisma.like.count({
      where: { createdAt: { gte: yesterday } },
    });

    // Pending reports (user-submitted reports waiting review)
    // The schema uses a separate `Report` model with enum `ReportStatus` (PENDING / RESOLVED)
    const pendingReports = await prisma.report.count({
      where: { status: "PENDING" },
    });

    // Signup series for last 30 days (simple per-day counts)
    const days = 30;
    const signupSeries = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
      signupSeries.push({ date: start.toISOString().slice(0, 10), count });
    }

    return res.status(200).json({
      success: true,
      analytics: {
        activeUsers: String(activeUsers),
        activeUsersChange: "+0%",
        newSignups: String(newSignups),
        newSignupsChange: "+0%",
        totalSwipes: String(totalSwipes),
        totalSwipesChange: "+0%",
        pendingReports: String(pendingReports),
        pendingReportsChange: "OK",
        signupSeries,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET MODERATION QUEUE (pending reports)
export const getModerationQueue = async (req, res) => {
  try {
    console.log('[MODERATION] Fetching moderation queue...');
    
    // Fetch pending reports and include reporter & reported user summaries
    const reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, firstName: true, name: true, email: true } },
        reportedUser: { select: { id: true, firstName: true, name: true, photos: true, email: true } },
      },
    });

    console.log(`[MODERATION] Found ${reports.length} pending reports`);

    // Map to a lightweight shape for the admin UI
    const queue = reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      createdAt: r.createdAt,
      reporter: r.reporter?.firstName || r.reporter?.name || r.reporter?.email || r.reporter?.id,
      reportedUser: r.reportedUser?.firstName || r.reportedUser?.name || r.reportedUser?.email || r.reportedUser?.id,
      reportedUserId: r.reportedUserId,
      reporterId: r.reporterId,
      content: Array.isArray(r.reportedUser?.photos) && r.reportedUser.photos.length > 0 ? r.reportedUser.photos[0] : null,
      raw: r,
    }));

    return res.status(200).json({ success: true, queue });
  } catch (err) {
    console.error('Get moderation queue error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ DISMISS A REPORT (mark as resolved without banning)
export const dismissReport = async (req, res) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    console.log(`[MODERATION] Dismissing report: ${reportId}`);

    // Update report status to RESOLVED
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' },
    });

    console.log(`[MODERATION] Report dismissed: ${reportId}`);
    return res.status(200).json({
      success: true,
      message: 'Report dismissed successfully',
      report: updatedReport,
    });
  } catch (err) {
    console.error('Dismiss report error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ✅ BAN USER (mark as resolved and ban the reported user)
export const banReportedUser = async (req, res) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    console.log(`[MODERATION] Banning user from report: ${reportId}`);

    // Get the report to find the reported user
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { reportedUserId: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Ban the reported user by updating their account status
    const bannedUser = await prisma.user.update({
      where: { id: report.reportedUserId },
      data: { accountStatus: 'BANNED' },
    });

    // Mark the report as RESOLVED
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' },
    });

    console.log(`[MODERATION] User banned: ${report.reportedUserId}`);
    return res.status(200).json({
      success: true,
      message: 'User banned successfully',
      bannedUser,
      report: updatedReport,
    });
  } catch (err) {
    console.error('Ban user error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
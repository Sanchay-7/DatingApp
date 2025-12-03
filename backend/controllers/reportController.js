import prisma from "../config/db.js";

// User submits a report about a message/user
export async function createReport(req, res) {
  try {
    const reporterId = req.user?.id; // from auth middleware
    const { reportedUserId, reason, messageId, conversationId } = req.body || {};

    if (!reporterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!reportedUserId || !reason) {
      return res.status(400).json({ error: "reportedUserId and reason are required" });
    }

    let messageText = undefined;
    if (messageId) {
      const msg = await prisma.message.findUnique({ where: { id: messageId } });
      // ciphertext cannot be decrypted here; store a placeholder
      if (msg) {
        messageText = "[Encrypted message captured]";
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        conversationId: conversationId || null,
        messageId: messageId || null,
        messageText: messageText || null,
      },
    });

    return res.status(201).json({ report });
  } catch (err) {
    console.error("createReport error:", err);
    return res.status(500).json({ error: "Failed to create report" });
  }
}

// Admin list reports with user profiles and basic context
export async function listReports(req, res) {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, firstName: true, name: true, photos: true, email: true },
        },
        reportedUser: {
          select: { id: true, firstName: true, name: true, photos: true, email: true, accountStatus: true },
        },
      },
    });
    return res.json({ reports });
  } catch (err) {
    console.error("listReports error:", err);
    return res.status(500).json({ error: "Failed to list reports" });
  }
}

// Admin action: ban user or leave
export async function actOnReport(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // "ban" | "leave"

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (action === "ban") {
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { accountStatus: "BANNED" },
      });
      await prisma.report.update({ where: { id }, data: { status: "RESOLVED" } });
      return res.json({ success: true, message: "User banned and report resolved" });
    }

    if (action === "leave") {
      await prisma.report.update({ where: { id }, data: { status: "RESOLVED" } });
      return res.json({ success: true, message: "Report marked as resolved without action" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("actOnReport error:", err);
    return res.status(500).json({ error: "Failed to act on report" });
  }
}

// Admin: get detailed report with reporter/reported profiles and shared conversation messages
export async function getReportDetail(req, res) {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        reportedUser: true,
      },
    });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Attempt to find a conversation that includes both users
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: report.reporterId } } },
          { participants: { some: { userId: report.reportedUserId } } },
        ],
      },
      include: {
        participants: true,
        // include secretKey for decryption
      },
    });

    let messages = [];
    if (conversation && conversation.participants.some(p => p.userId === report.reportedUserId)) {
      messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, senderId: true, createdAt: true, ciphertext: true, iv: true, authTag: true },
      });

      // Attempt server-side decryption using conversation.secretKey
      try {
        const nodeCrypto = await import('crypto');
        const key = Buffer.from((conversation.secretKey || ''), 'base64');
        if (key && key.length > 0) {
          messages = messages.map(m => {
            try {
              const iv = Buffer.from(m.iv, 'base64');
              const authTag = Buffer.from(m.authTag, 'base64');
              const ciphertext = Buffer.from(m.ciphertext, 'base64');
              const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', key, iv);
              decipher.setAuthTag(authTag);
              const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
              return { ...m, plaintext: decrypted };
            } catch (e) {
              return { ...m, plaintext: null };
            }
          });
        }
      } catch (e) {
        // ignore decryption errors; plaintext will remain null
      }
    }

    return res.status(200).json({
      success: true,
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
        conversationId: report.conversationId || null,
        messageId: report.messageId || null,
        messageText: report.messageText || null,
      },
      reporter: report.reporter,
      reportedUser: report.reportedUser,
      conversation: conversation ? { id: conversation.id, participants: conversation.participants } : null,
      messages,
    });
  } catch (err) {
    console.error("getReportDetail error:", err);
    return res.status(500).json({ error: "Failed to get report detail" });
  }
}

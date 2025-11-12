import prisma from "../config/db.js";
import getAblyClient from "../config/ably.js";
import {
  generateConversationKey,
  encryptMessage,
} from "../utils/encryption.js";

const toArray = (value) => (Array.isArray(value) ? value : []);

const buildConversationPayload = (conversation, currentUserId) => {
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  const otherUser = otherParticipant?.user;

  const photos = toArray(otherUser?.photos);
  const firstPhoto = photos.length > 0 ? photos[0] : null;

  return {
    id: conversation.id,
    secretKey: conversation.secretKey,
    channel: `conversation:${conversation.id}`,
    participant: otherUser
      ? {
          id: otherUser.id,
          name: otherUser.name || otherUser.firstName || "Valise Member",
          photo: firstPhoto,
        }
      : null,
    lastMessage: conversation.messages?.[0]
      ? {
          senderId: conversation.messages[0].senderId,
          ciphertext: conversation.messages[0].ciphertext,
          iv: conversation.messages[0].iv,
          authTag: conversation.messages[0].authTag,
          createdAt: conversation.messages[0].createdAt,
        }
      : null,
  };
};

export const startConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    if (targetUserId === userId) {
      return res
        .status(400)
        .json({ error: "Cannot start a conversation with yourself" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        participants: {
          some: { userId },
        },
        AND: {
          participants: {
            some: { userId: targetUserId },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                photos: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (existing) {
      try {
        const payload = buildConversationPayload(existing, userId);
        return res.status(200).json({
          success: true,
          conversation: payload,
        });
      } catch (payloadErr) {
        console.error("Error building existing conversation payload:", payloadErr);
        throw payloadErr;
      }
    }

    const secretKey = generateConversationKey();

    const conversation = await prisma.conversation.create({
      data: {
        secretKey,
        participants: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
    });

    // Fetch the conversation with full participant data
    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                photos: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!fullConversation) {
      throw new Error("Failed to fetch created conversation");
    }

    try {
      const payload = buildConversationPayload(fullConversation, userId);
      return res.status(201).json({
        success: true,
        conversation: payload,
      });
    } catch (payloadErr) {
      console.error("Error building new conversation payload:", payloadErr);
      throw payloadErr;
    }
  } catch (err) {
    console.error("Start conversation error:", err.message || err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

export const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                photos: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const payload = conversations.map((conversation) =>
      buildConversationPayload(conversation, userId)
    );

    return res.status(200).json({
      success: true,
      conversations: payload,
    });
  } catch (err) {
    console.error("List conversations error:", err.message || err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      messages,
      secretKey: conversation.secretKey,
      channel: `conversation:${conversationId}`,
    });
  } catch (err) {
    console.error("Get messages error:", err.message || err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res
        .status(400)
        .json({ error: "conversationId and message are required" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const encrypted = encryptMessage(conversation.secretKey, message);

    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    });

    const ablyClient = getAblyClient();
    if (ablyClient) {
      try {
        await ablyClient.channels
          .get(`conversation:${conversationId}`)
          .publish("message", {
            id: savedMessage.id,
            conversationId,
            senderId: userId,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            createdAt: savedMessage.createdAt,
          });
      } catch (publishErr) {
        console.error("Ably publish error:", publishErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: {
        id: savedMessage.id,
        conversationId,
        senderId: userId,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (err) {
    console.error("Send message error:", err.message || err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

export const getAblyToken = async (req, res) => {
  try {
    const ablyClient = getAblyClient();
    if (!ablyClient) {
      return res
        .status(500)
        .json({ error: "Ably client not configured on the server" });
    }

    const tokenRequest = await new Promise((resolve, reject) => {
      ablyClient.auth.createTokenRequest(
        { clientId: req.user.id, ttl: 1000 * 60 * 60 },
        (err, tokenRequest) => {
          if (err) {
            reject(err);
          } else {
            resolve(tokenRequest);
          }
        }
      );
    });

    return res.status(200).json({
      success: true,
      tokenRequest,
    });
  } catch (err) {
    console.error("Ably token error:", err.message || err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};


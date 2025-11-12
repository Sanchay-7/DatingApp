import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  startConversation,
  listConversations,
  getMessages,
  sendMessage,
  getAblyToken,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/start", startConversation);
router.get("/conversations", listConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", sendMessage);
router.get("/token", getAblyToken);

export default router;


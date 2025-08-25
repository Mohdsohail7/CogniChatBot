const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new chat
router.post("/", authMiddleware, chatController.createChat);

// Get all chats
router.get("/", authMiddleware, chatController.getChats);

// Get messages of a specific chat
router.get("/:chatId", authMiddleware, chatController.getChatMessages);

// stream AI reply
router.post("/:chatId/messages", authMiddleware, chatController.sendMessage);

// Stop AI response streaming
router.post("/:chatId/stop", authMiddleware, chatController.stopStreaming);

// update chat title / rename chat
router.put("/:chatId/title", authMiddleware, chatController.updateChatTitle);

// delete chat
router.delete("/:chatId", authMiddleware, chatController.deleteChat);

module.exports = router;
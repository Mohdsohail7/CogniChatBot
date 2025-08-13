const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

// Create a new chat
router.post("/", chatController.createChat);

// Get all chats
router.get("/", chatController.getChats);

// Get messages of a specific chat
router.get("/:chatId", chatController.getChatMessages);

// Get messages of a specific chat
router.post("/:chatId/message", chatController.sendMessage);

// Stop AI response streaming
router.post("/:chatId/stop", chatController.stopStreaming);

module.exports = router;
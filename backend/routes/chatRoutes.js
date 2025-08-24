const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

// Create a new chat
router.post("/", chatController.createChat);

// Get all chats
router.get("/", chatController.getChats);

// Get messages of a specific chat
router.get("/:chatId", chatController.getChatMessages);

// stream AI reply
router.get("/:chatId/messages", chatController.sendMessage);

// Stop AI response streaming
router.post("/:chatId/stop", chatController.stopStreaming);

// update chat title / rename chat
router.put("/:chatId/title", chatController.updateChatTitle);

// delete chat
router.delete("/:chatId", chatController.deleteChat);

module.exports = router;
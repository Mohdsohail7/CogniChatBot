const { Chat, Message } = require("../models");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Track active Ollama processes for stop functionality
const activeProcesses = {};
// Store partial bot replies
let partialReplies = {};

// user chat create
exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.create({ title, user_id: req.user.id, });
    return res.status(201).json(chat);
  } catch (error) {
    console.error("Error in create chats", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// get user chat
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
    });
    return res.json(chats);
  } catch (error) {
    console.error("Error in get chats", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    // ensure the chat belongs to this user
    const chat = await Chat.findOne({
      where: { id: chatId, user_id: req.user.id },
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    const messages = await Message.findAll({
      where: { chat_id: chatId },
      order: [["timestamp", "ASC"]],
    });
    return res.json(messages);
  } catch (error) {
    console.error("error in get chat message", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// send message using Groq API (streaming)
exports.sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;

    let controller;
    let botReply = "";

    // check ownership
    try {
      const chat = await Chat.findOne({
      where: { id: chatId, user_id: req.user.id },
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // store user message in DB
    await Message.create({
      chat_id: chatId,
      role: "user",
      content,
    });

    // setup streaming response headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // tracking structures
    partialReplies[chatId] = "";
    controller = new AbortController();
    activeProcesses[chatId] = controller;

    // Tell frontend "bot is typing..."
    res.write(`event: typing\n`);
    res.write(`data: ${JSON.stringify({ typing: true })}\n\n`);

    // call Groq API with streaming
    const stream = await groq.chat.completions.create(
      {
        model: "llama3-8b-8192", // you can also use "mixtral-8x7b-32768" or "gemma-7b-it"
        messages: [{ role: "user", content }],
        stream: true,
      },
      { signal: controller.signal } // pass abort signal
    );

    let firstChunk = true;

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";
      if (!token) continue;

      botReply += token;
      partialReplies[chatId] = botReply;

      if (firstChunk) {
        res.write(`event: typing\n`);
        res.write(`data: ${JSON.stringify({ typing: false })}\n\n`);
        firstChunk = false;
      }

      res.write(`event: message\n`);
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    // save bot reply in DB
    await Message.create({
      chat_id: chatId,
      role: "bot",
      content: botReply,
    });

    // tell frontend we're done
    res.write(`event: done\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();

    } catch (error) {
      console.error("Error in sendMessage:", error);

      // only send error if connection still open
      if (!res.writableEnded) {
        if (!res.headersSent) {
          res.setHeader("Content-Type", "text/event-stream");
          res.flushHeaders();
        }

        res.write(`event: typing\n`);
        res.write(`data: ${JSON.stringify({ typing: false })}\n\n`);

        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }

    } finally {
    // always clean up
    delete activeProcesses[chatId];
    delete partialReplies[chatId];
  }
    
};

// Stop an ongoing response
exports.stopStreaming = async (req, res) => {
  const { chatId } = req.params;
  const controller = activeProcesses[chatId];

  if (controller) {
    controller.abort(); // stop stream immediately

    // Save partial bot message before deleting
    // This requires tracking botReply globally per chatId
    if (partialReplies[chatId]) {
      await Message.create({
        chat_id: chatId,
        role: "bot",
        content: partialReplies[chatId],
      });
    }

    delete activeProcesses[chatId];
    delete partialReplies[chatId];
    return res.json({ stopped: true });
  }
  return res.status(400).json({ stopped: false });
};

// Update chat title
exports.updateChatTitle = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await Chat.findOne({
      where: { id: chatId, user_id: req.user.id }
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.title = title;
    await chat.save();

    return res.json({ message: "Chat title updated", chat });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      where: { id: chatId, user_id: req.user.id },
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // delete messages first (FK constraint)
    await Message.destroy({ where: { chat_id: chatId } });

    // delete chat
    await chat.destroy();

    return res.json({ message: "Chat deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

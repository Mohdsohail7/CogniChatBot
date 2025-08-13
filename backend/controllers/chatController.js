const { Chat, Message } = require("../models");
const { spawn } = require("child_process");


// Track active Ollama processes for stop functionality
const activeProcesses = {};
// Store partial bot replies
let partialReplies = {};

// user chat create
exports.createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const chat = await Chat.create({ title });
        return res.status(201).json(chat);

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// get user chat
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.findAll({
            order: [["createdAt", "DESC"]],
        });
        return res.json(chats);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.findAll({ where: { chat_id: chatId }, order: [["createdAt", "ASC"]] });
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// send messaged
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        // store user message
        await Message.create({
            chat_id: chatId,
            role: "user",
            content
        });

        // Set up streaming response
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        // Spawn Ollama process 
        const ollama = spawn("ollama", ["run", "gemma:1b", "--stream"]);

        activeProcesses[chatId] = ollama;

        let botReply = "";

        ollama.stdin.write(content + "\n");
        ollama.stdin.end();

        ollama.stdout.on("data", async (data) => {
            const token = data.toString();
            botReply += token;
            res.write(`event: message\n`);
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        });

        ollama.stderr.on("data", (data) => {
            console.error(`Ollama error: ${data}`);
        });

        ollama.on("close", async () => {
            delete activeProcesses[chatId];
            await Message.create({
                chat_id: chatId,
                role: "bot",
                content: botReply
            })
            res.write(`event: done\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// Stop an ongoing response
exports.stopStreaming = async (req, res) => {
    const { chatId } = req.params;
    if (activeProcesses[chatId]) {
        const process = activeProcesses[chatId];
        process.kill();

        // Save partial bot message before deleting
        // This requires tracking botReply globally per chatId
        if (partialReplies[chatId]) {
            await Message.create({
                chat_id: chatId,
                role: "bot",
                content: partialReplies[chatId]
            });
        }

        delete activeProcesses[chatId];
        delete partialReplies[chatId];
        return res.json({ stopped: true });
    }
    return res.status(400).json({ stopped: false });
};

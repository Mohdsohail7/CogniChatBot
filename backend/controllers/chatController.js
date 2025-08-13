const { Chat, Message } = require("../models");
const { spawn } = require("child_process");

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
        const chats = await Chat.findAll();
        return res.json(chats);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.findAll({ where: { chat_id: chatId }});
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
        
        // Stream AI response from Ollama
        const ollama = spawn("ollama", ["run", "gemma:1b"]);

        let botReply = "";

        ollama.stdin.write(content + "\n");
        ollama.stdin.end();

        ollama.stdout.on("data", async (data) => {
            const token = data.toString();
            botReply += token;
            res.write(token);
        });

        ollama.on("close", async () => {
            await Message.create({
                chat_id: chatId,
                role: "bot",
                content: botReply
            })
            res.end();
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}
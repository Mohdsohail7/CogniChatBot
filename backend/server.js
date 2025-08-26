require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { connectDB, sequelize } = require("./config/config");

app.use(cors({
    origin: "https://cogni-chat-bot.vercel.app",
    credentials: true
}));
app.use(express.json());


// routes mounte
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

// routes unmountes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
    res.send("CogniChatBot backend is Running...");
})

const port = process.env.PORT || 4000;

(async () => {
    await connectDB();
    await sequelize.sync();
    console.log("All models synced to database.");

    app.listen(port, () => {
    console.log(`Server is Running at Port: ${port}`);
});
})();


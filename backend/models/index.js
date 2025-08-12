const Chat = require("./Chat");
const Message = require("./Message");
const User = require("./User");


// Associtions
User.hasMany(Chat, { foreignKey: "user_id", onDelete: "CASCADE" });
Chat.belongsTo(User, { foreignKey: "user_id" });

Chat.hasMany(Message, { foreignKey: "chat_id", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });

module.exports = { User, Chat, Message };

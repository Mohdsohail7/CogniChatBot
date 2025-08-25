const { DataTypes, sequelize } = require("../config/config");
const Message = require("./Message");
const User = require("./User")

const Chat = sequelize.define("Chat", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
    type: DataTypes.UUID, // assuming your User.id is UUID
    allowNull: false,
    references: {
      model: User,
      key: "id"
    },
    onDelete: "CASCADE"
  }
},
{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
}
);

// Relation (One user -> many chats)
User.hasMany(Chat, { foreignKey: "user_id" });
Chat.belongsTo(User, { foreignKey: "user_id" });

// Relation (One chat -> many messages)
Chat.hasMany(Message, { foreignKey: "chat_id"});
Message.belongsTo(Chat, { foreignKey: "chat_id"})

module.exports = Chat;
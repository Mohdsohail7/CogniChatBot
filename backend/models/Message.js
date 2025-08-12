const { DataTypes, sequelize } = require("../config/config");

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    chat_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("user", "bot"),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
},
{
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false
}
);

module.exports = Message;
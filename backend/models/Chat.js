const { DataTypes, sequelize } = require("../config/config");

const Chat = sequelize.define("Chat", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
}
);

module.exports = Chat;
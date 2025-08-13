const { DataTypes, sequelize } = require("../config/config");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar_url: {
        type: DataTypes.STRING,
        allowNull: true // store Google profile pic
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false
    },
},
{
    timestamps: true
}
);
module.exports = User;
const { DataTypes, sequelize } = require("../config/config");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
    provider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    providerId: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    timestamps: true
}
);
module.exports = User;
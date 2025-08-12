require("dotenv").config();
const sq = require("sequelize");

const sequelize = new sq.Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

module.exports = { DataTypes: sq.DataTypes, sequelize, connectDB };

require("dotenv").config();
console.log(process.env.DB_HOST);
const sq = require("sequelize");

const sequelize = new sq.Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true, rejectUnauthorized: false
            }
        }
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

require("dotenv").config();
console.log(process.env.DB_HOST);
const sq = require("sequelize");

const sequelize = new sq.Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  pool: {
    max: 5,    // prevent "too many connections"
    min: 0,
    idle: 10000,
  },
});

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

module.exports = { DataTypes: sq.DataTypes, sequelize, connectDB };

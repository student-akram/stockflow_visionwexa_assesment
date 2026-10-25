
require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? { minVersion: "TLSv1.2" }
          : undefined,
    },
  }
);

module.exports = sequelize;

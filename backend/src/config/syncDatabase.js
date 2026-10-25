
const {
  sequelize,
  Organization,
  User,
  Product,
} = require("../models");

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful.");

    await sequelize.sync();

    console.log("Database tables created successfully.");
    console.log("Tables: organizations, users, products");
  } catch (error) {
    console.error("Database synchronization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();

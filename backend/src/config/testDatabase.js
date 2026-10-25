
const sequelize = require("./database");

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully!");

    const [rows] = await sequelize.query(
      "SELECT DATABASE() AS databaseName, VERSION() AS version"
    );

    console.log("Database:", rows[0].databaseName);
    console.log("Version:", rows[0].version);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/organization", organizationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "StockFlow API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "StockFlow backend is healthy",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`StockFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exitCode = 1;
  }
}

startServer();

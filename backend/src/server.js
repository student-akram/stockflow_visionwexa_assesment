
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://stockflow-visionwexa-assesment.vercel.app",
  "https://stockflow-visionwexa-assesment-4mje394cm-shaikakrams-projects.vercel.app",
];

// CORS must be registered before your API routes
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



// Parse JSON request bodies
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const organizationRoutes = require("./routes/organizationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/organization", organizationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "StockFlow API is running",
  });
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "StockFlow backend is healthy",
  });
});

// Handle unexpected errors safely
app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StockFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exitCode = 1;
  }
}

startServer();

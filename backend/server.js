const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// ===============================
// Allowed Frontend URLs
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "https://stock-trade-simulator-murex.vercel.app",
  "https://stock-trade-simulator-git-main-harini-f65c.vercel.app",
  "https://stock-trade-simulator-7ddj4swaa-harini-f65c.vercel.app"
];

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / curl
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// MongoDB Connection Check
// ===============================
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected.",
    });
  }

  next();
});

// ===============================
// Routes
// ===============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trade", require("./routes/tradeRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "TradeSim API is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
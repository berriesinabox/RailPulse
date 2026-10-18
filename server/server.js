
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const faultRoutes = require("./routes/faultRoutes");
const app = express();
const authRoutes = require("./routes/authRoutes");
const PORT = process.env.PORT || 5000;
const userRoutes = require("./routes/userRoutes");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/faults", faultRoutes);

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "RailPulse API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RailPulse Backend",
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`RailPulse server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start RailPulse:", error.message);
    process.exit(1);
  }
}

startServer();

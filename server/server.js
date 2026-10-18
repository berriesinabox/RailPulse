
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const faultRoutes = require("./routes/faultRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean),
  })
);

app.use(express.json());

// Cache the MongoDB connection across serverless invocations.
let connectionPromise;

async function connectToDatabase(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing.");
      }

      if (!connectionPromise) {
        connectionPromise = mongoose
          .connect(process.env.MONGODB_URI)
          .catch((error) => {
            connectionPromise = null;
            throw error;
          });
      }

      await connectionPromise;
    }

    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
}

app.get("/", (req, res) => {
  res.json({ message: "RailPulse API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "RailPulse Backend",
  });
});

// Connect to MongoDB before handling API requests.
app.use("/api", connectToDatabase);

app.use("/api/auth", authRoutes);
app.use("/api/faults", faultRoutes);
app.use("/api/users", userRoutes);

// Local development only. Vercel imports the exported app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`RailPulse server running on port ${PORT}`);
  });
}

module.exports = app;

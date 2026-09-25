const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const followUpRoutes = require("./routes/followUpRoutes");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "EduLead API is running",
  });
});

// Test MongoDB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const User = require("./models/User");

    const count = await User.countDocuments();

    res.json({
      success: true,
      message: "MongoDB is working",
      userCount: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Lead management
app.use("/api/leads", leadRoutes);

// Follow-ups
app.use("/api/leads", followUpRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/engineers
// Only Admins can retrieve the Engineer list.
router.get(
  "/engineers",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const engineers = await User.find({
        role: "Engineer",
      })
        .select("name email")
        .sort({ name: 1 });

      res.status(200).json({ engineers });
    } catch (error) {
      console.error("Fetch engineers error:", error.message);
      res.status(500).json({
        message: "Failed to fetch engineers.",
      });
    }
  }
);

module.exports = router;

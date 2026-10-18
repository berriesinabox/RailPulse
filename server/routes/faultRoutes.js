
const express = require("express");
const mongoose = require("mongoose");
const Fault = require("../models/Fault");
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// GET /api/faults - retrieve faults according to user role
router.get("/", protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Passenger") {
      filter = { reportedBy: req.user._id };
    } else if (req.user.role === "Engineer") {
      filter = { assignedEngineer: req.user._id };
    }else if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "You do not have permission to view faults.",
      });
    }
    // Admin can view all faults.

    const faults = await Fault.find(filter)
      .populate("assignedEngineer", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(faults);
  } catch (error) {
    console.error("Fetch faults error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve faults",
    });
  }
});

// POST /api/faults - create a fault
router.post(
  "/",
  protect,
  authorize("Passenger", "Engineer", "Admin"),
  async (req, res) => {
  try {
        const { title, description, location, severity } = req.body;

        if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof location !== "string" ||
        !title.trim() ||
        !description.trim() ||
        !location.trim()
        ) {
        return res.status(400).json({
            message: "Title, description and location are required.",
        });
        }

        const fault = await Fault.create({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        severity,
        reportedBy: req.user._id,
        });

        res.status(201).json({
        message: "Fault reported successfully",
        fault,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Invalid fault data",
        });
        }

        console.error("Create fault error:", error.message);
        res.status(500).json({
        message: "Failed to create fault",
        });
    }
    }
);

// PATCH /api/faults/:id/status - update fault status
router.patch(
  "/:id/status",
  protect,
  authorize("Engineer", "Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid fault ID.",
        });
      }

      const allowedStatuses = ["Open", "In Progress", "Resolved"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status.",
        });
      }

      const fault = await Fault.findById(id);

      if (!fault) {
        return res.status(404).json({
          message: "Fault not found.",
        });
      }

      // Engineers may update only faults assigned to them.
      if (
        req.user.role === "Engineer" &&
        String(fault.assignedEngineer) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can update only faults assigned to you.",
        });
      }

      fault.status = status;
      await fault.save();

      res.status(200).json({
        message: "Fault status updated successfully",
        fault,
      });
    } catch (error) {
      console.error("Update status error:", error.message);
      res.status(500).json({
        message: "Failed to update fault status",
      });
    }
  }
);


 // PATCH /api/faults/:id/assign - Admin assigns a fault to an Engineer
router.patch(
  "/:id/assign",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { engineerId } = req.body;

      if (
        !mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(engineerId)
      ) {
        return res.status(400).json({
          message: "Invalid fault ID or engineer ID.",
        });
      }

      const fault = await Fault.findById(id);

      if (!fault) {
        return res.status(404).json({
          message: "Fault not found.",
        });
      }

      const engineer = await User.findOne({
        _id: engineerId,
        role: "Engineer",
      });

      if (!engineer) {
        return res.status(400).json({
          message: "The selected user is not a valid Engineer.",
        });
      }

      fault.assignedEngineer = engineer._id;
      await fault.save();

      const updatedFault = await Fault.findById(fault._id)
        .populate("assignedEngineer", "name email");

      return res.status(200).json({
        message: "Fault assigned successfully.",
        fault: updatedFault,
      });
    } catch (error) {
      console.error("Assign fault error:", error.message);
      return res.status(500).json({
        message: "Failed to assign fault.",
      });
    }
  }
);


// DELETE /api/faults/:id - Admin only
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid fault ID.",
        });
      }

      const deletedFault = await Fault.findByIdAndDelete(id);

      if (!deletedFault) {
        return res.status(404).json({
          message: "Fault not found.",
        });
      }

      res.status(200).json({
        message: "Fault deleted successfully.",
      });
    } catch (error) {
      console.error("Delete fault error:", error.message);
      res.status(500).json({
        message: "Failed to delete fault.",
      });
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} = require("../controllers/leadController");

// Public routes
router.get("/", getLeads);
router.get("/:id", getLeadById);

// Protected routes
router.post("/", authMiddleware, createLead);
router.put("/:id", authMiddleware, updateLead);
router.delete("/:id", authMiddleware, deleteLead);

module.exports = router;
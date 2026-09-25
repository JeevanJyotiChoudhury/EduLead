const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getCounsellors,
} = require("../controllers/leadController");

const router = express.Router();

// All lead APIs require authentication
router.use(protect);

router.post("/", createLead);

router.get("/", getLeads);

router.get("/counsellors", getCounsellors);

router.get("/:id", getLeadById);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

router.put("/:id/assign", assignLead);

module.exports = router;

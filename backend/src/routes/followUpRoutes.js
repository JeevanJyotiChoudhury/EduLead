const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createFollowUp,
  getLeadFollowUps,
} = require("../controllers/followUpController");

const router = express.Router();

router.use(protect);

router.post("/:leadId/followups", createFollowUp);

router.get("/:leadId/followups", getLeadFollowUps);

module.exports = router;

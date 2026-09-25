const FollowUp = require("../models/FollowUp");
const Lead = require("../models/Lead");

const createFollowUp = async (req, res) => {
  try {
    const { date, notes, outcome, nextFollowUpDate } = req.body;

    if (!date || !notes) {
      return res.status(400).json({
        success: false,
        message: "Date and notes are required",
      });
    }

    const lead = await Lead.findById(req.params.leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const followUp = await FollowUp.create({
      lead: lead._id,
      counsellor: req.user.id,
      date,
      notes,
      outcome,
      nextFollowUpDate,
    });

    // Update lead's follow-up information
    lead.lastContactedAt = date;

    if (nextFollowUpDate) {
      lead.nextFollowUpDate = nextFollowUpDate;
      lead.status = "FOLLOW_UP";
    }

    await lead.save();

    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate("lead", "name phone coursePreference")
      .populate("counsellor", "name email");

    res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      followUp: populatedFollowUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLeadFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({
      lead: req.params.leadId,
    })
      .populate("counsellor", "name email")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFollowUp,
  getLeadFollowUps,
};

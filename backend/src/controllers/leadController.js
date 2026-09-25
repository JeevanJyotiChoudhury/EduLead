const Lead = require("../models/Lead");
const User = require("../models/User");

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, phone, email, coursePreference, source, notes } = req.body;

    if (!name || !phone || !coursePreference || !source) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, course preference and source are required",
      });
    }

    // Prevent duplicate leads using the same phone number
    const existingLead = await Lead.findOne({ phone: phone.trim() });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "A lead with this phone number already exists",
      });
    }

    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      coursePreference: coursePreference.trim(),
      source,
      notes: notes ? notes.trim() : "",
      status: "NEW",
    };

    // If a counsellor creates a lead,
    // automatically assign the lead to that counsellor.
    if (req.user.role === "COUNSELLOR") {
      leadData.assignedCounsellor = req.user.id;
    }

    const lead = await Lead.create(leadData);

    const populatedLead = await Lead.findById(lead._id).populate(
      "assignedCounsellor",
      "name email role",
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all leads
const getLeads = async (req, res) => {
  try {
    const { status, source, assignedCounsellor, search } = req.query;

    const filter = {};

    // Counsellors can only see their assigned leads
    if (req.user.role === "COUNSELLOR") {
      filter.assignedCounsellor = req.user.id;
    } else if (assignedCounsellor) {
      filter.assignedCounsellor = assignedCounsellor;
    }

    if (status) {
      filter.status = status;
    }

    if (source) {
      filter.source = source;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("assignedCounsellor", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single lead
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedCounsellor",
      "name email role",
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Counsellors can only access their assigned leads
    if (
      req.user.role === "COUNSELLOR" &&
      (!lead.assignedCounsellor ||
        lead.assignedCounsellor._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this lead",
      });
    }

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Counsellors can only update their assigned leads
    if (
      req.user.role === "COUNSELLOR" &&
      (!lead.assignedCounsellor ||
        lead.assignedCounsellor.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update leads assigned to you",
      });
    }

    const {
      name,
      phone,
      email,
      coursePreference,
      source,
      status,
      notes,
      lastContactedAt,
      nextFollowUpDate,
    } = req.body;

    // Check duplicate phone if phone is being changed
    if (phone && phone.trim() !== lead.phone) {
      const existingLead = await Lead.findOne({
        phone: phone.trim(),
        _id: { $ne: lead._id },
      });

      if (existingLead) {
        return res.status(409).json({
          success: false,
          message: "A lead with this phone number already exists",
        });
      }
    }

    if (name !== undefined) {
      lead.name = name.trim();
    }

    if (phone !== undefined) {
      lead.phone = phone.trim();
    }

    if (email !== undefined) {
      lead.email = email ? email.trim().toLowerCase() : "";
    }

    if (coursePreference !== undefined) {
      lead.coursePreference = coursePreference.trim();
    }

    if (source !== undefined) {
      lead.source = source;
    }

    if (status !== undefined) {
      lead.status = status;
    }

    if (notes !== undefined) {
      lead.notes = notes ? notes.trim() : "";
    }

    if (lastContactedAt !== undefined) {
      lead.lastContactedAt = lastContactedAt || null;
    }

    if (nextFollowUpDate !== undefined) {
      lead.nextFollowUpDate = nextFollowUpDate || null;
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id).populate(
      "assignedCounsellor",
      "name email role",
    );

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a lead
const deleteLead = async (req, res) => {
  try {
    // Only managers can delete leads
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        message: "Only managers can delete leads",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign a lead to a counsellor
const assignLead = async (req, res) => {
  try {
    // Only managers can assign leads
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({
        success: false,
        message: "Only managers can assign leads",
      });
    }

    const { counsellorId } = req.body;

    if (!counsellorId) {
      return res.status(400).json({
        success: false,
        message: "Counsellor ID is required",
      });
    }

    const counsellor = await User.findOne({
      _id: counsellorId,
      role: "COUNSELLOR",
    });

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: "Counsellor not found",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.assignedCounsellor = counsellor._id;

    await lead.save();

    const updatedLead = await Lead.findById(lead._id).populate(
      "assignedCounsellor",
      "name email role",
    );

    res.json({
      success: true,
      message: "Lead assigned successfully",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get counsellors
const getCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({
      role: "COUNSELLOR",
    }).select("name email role");

    res.json({
      success: true,
      counsellors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getCounsellors,
};

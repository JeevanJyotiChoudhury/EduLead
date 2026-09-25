const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    coursePreference: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "WEBSITE",
        "WALK_IN",
        "PHONE",
        "WHATSAPP",
        "FAIR",
        "CAMPAIGN",
        "OTHER",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "INTERESTED",
        "FOLLOW_UP",
        "CONVERTED",
        "NOT_INTERESTED",
      ],
      default: "NEW",
    },

    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },

    lastContactedAt: {
      type: Date,
      default: null,
    },

    nextFollowUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lead", leadSchema);

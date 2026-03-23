const mongoose = require("mongoose");

const ACTIVITY_TYPES = require("../constants/activityTypes");
const ACTIVITY_CATEGORIES = require("../constants/activityCategories");

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    enum: Object.values(ACTIVITY_CATEGORIES),
  },

  type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPES),
    required: true,
  },

  goalValue: mongoose.Schema.Types.Mixed,

  actualValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },

  completed: {
    type: Boolean,
    default: false,
  },

  score: {
    type: Number,
    default: 0,
  },
});

const ritualSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,

  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activities: [activitySchema],

  totalScore: {
    type: Number,
    default: 0,
  },
},
  { timestamps: true },
);
ritualSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("MorningRitual", ritualSchema);

const mongoose = require("mongoose");

const mentalWellnessSchema = new mongoose.Schema({
 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
},
 
  date: {
    type: Date,
    required: true,

  },

  meditationMinutes: {
    type: Number,
    default: 0,
  },

  breathingSessions: {
    type: Number,
    default: 0,
  },

  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  moodEmoji: {
    type: String,
  },

  wellnessScore: {
    type: Number,
  },
},
  { timestamps: true },
);
mentalWellnessSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports =
  mongoose.models.MentalWellnessEntry ||
  mongoose.model("MentalWellnessEntry", mentalWellnessSchema);

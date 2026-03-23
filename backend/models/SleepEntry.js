const mongoose = require("mongoose");

const sleepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },

  sleepConsistencyScore: Number,

  sleepQuality: {
    type: Number,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 10;
      },
    },
  },

  sleepTime: {
    type: Date,
    required: true,
  },

  actualSleepTime: {
    type: Date,
    required: true,
  },

  wakeupTime: {
    type: Date,
    required: true,
  },

  actualWakeupTime: {
    type: Date,
    required: true,
  },
},


  {
    timestamps: true, // ✅ gives createdAt automatically
  },
);
sleepSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("SleepEntry", sleepSchema);

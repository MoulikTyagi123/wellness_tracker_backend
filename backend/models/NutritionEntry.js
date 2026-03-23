const mongoose = require("mongoose");
const { GOAL_TYPES_ENUM } = require("../constants/goalTypes");

const nutritionSchema = new mongoose.Schema(
  {
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    
    date: {
      type: Date,
      required: true,
    
    },

    goalType: {
      type: String,
      enum: GOAL_TYPES_ENUM,
      required: true,
    },

    targetCalories: {
      type: Number,
      required: true,
    },

    actualCalories: Number,

    targetProtein: {
      type: Number,
      required: true,
    },

    actualProtein: Number,

    targetWater: {
      type: Number,
      required: true,
    },

    actualWater: Number,

    weight: Number, // optional

    score: Number,
  },
  { timestamps: true },
);
nutritionSchema.index({ userId: 1, date: 1 }, { unique: true })
module.exports = mongoose.model("NutritionEntry", nutritionSchema);

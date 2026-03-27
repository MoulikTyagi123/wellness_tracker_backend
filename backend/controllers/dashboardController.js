const {
  getTodayDashboard: getTodayDashboardService,
} = require("../services/dashboardService");
const SleepEntry = require("../models/SleepEntry");
const NutritionEntry = require("../models/NutritionEntry");
const MentalWellnessEntry = require("../models/mentalWellnessEntry");
const {
  calculateStreak,
  calculateGenericStreak,
} = require("../services/streakService");
const { generateInsights } = require("../services/insightService");

// ✅ GET DASHBOARD
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await getTodayDashboardService(userId);

    // ✅ EXISTING (sleep streak)
    const sleepEntries = await SleepEntry.find({ userId });
    const sleepStreak = calculateStreak(sleepEntries);

    // 🔥 NEW ADDITIONS (THIS IS WHAT I MEANT BY MODIFY THIS PART ONLY)
    const nutritionEntries = await NutritionEntry.find({ userId });
    const mentalEntries = await MentalWellnessEntry.find({ userId });

    const calorieStreak = calculateGenericStreak(
      nutritionEntries,
      "actualCalories",
    );

    const moodStreak = calculateGenericStreak(mentalEntries, "mood");

    // ✅ FINAL RESPONSE
    res.json({
      ...data,
      sleepStreak,
      calorieStreak, // ✅ NEW
      moodStreak, // ✅ NEW
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };

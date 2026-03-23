const { getTodayDashboard } = require("../services/dashboardService");
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

    const data = await getTodayDashboard(userId);

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

// ✅ GET MY ANALYTICS (NO CHANGE)
const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = "30", type = "sleep" } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    if (range === "7") startDate.setDate(today.getDate() - 6);
    else if (range === "15") startDate.setDate(today.getDate() - 14);
    else startDate.setDate(today.getDate() - 30);

    startDate.setHours(0, 0, 0, 0);

    const filter = {
      userId,
      date: { $gte: startDate, $lte: today },
    };

    const sleep = await SleepEntry.find(filter);
    const nutrition = await NutritionEntry.find(filter);
    const mental = await MentalWellnessEntry.find(filter);

    const result = {};
    const formatDate = (d) => new Date(d).toISOString().split("T")[0];

    sleep.forEach((e) => {
      const date = formatDate(e.date);
      if (!result[date]) result[date] = { date };

      const hours =
        (new Date(e.actualWakeupTime) - new Date(e.actualSleepTime)) /
        (1000 * 60 * 60);

      result[date].sleep = Number(hours.toFixed(2));
    });

    nutrition.forEach((e) => {
      const date = formatDate(e.date);
      if (!result[date]) result[date] = { date };

      result[date].calories = e.actualCalories || 0;
    });

    mental.forEach((e) => {
      const date = formatDate(e.date);
      if (!result[date]) result[date] = { date };

      result[date].mood = e.mood || 0;
    });

    let finalData = Object.values(result).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    const filled = [];
    const totalDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const formatted = formatDate(d);
      const existing = finalData.find((x) => x.date === formatted);

      filled.push(
        existing || {
          date: formatted,
          sleep: null,
          calories: null,
          mood: null,
        },
      );
    }

    const clean = filled.filter(
      (d) => d[type] !== null && d[type] !== undefined,
    );

    const insights = generateInsights(clean, type);

    res.json({
      data: filled,
      insights,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getMyAnalytics };

const dashboardService = require("../services/dashboardService");
const SleepEntry = require("../models/SleepEntry");
const NutritionEntry = require("../models/NutritionEntry");
const MentalWellnessEntry = require("../models/mentalWellnessEntry");
const streakService = require("../services/streakService");
const { generateInsights } = require("../services/insightService");

// ✅ GET DASHBOARD
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Call via module reference — never destructured
    const data = await dashboardService.getTodayDashboard(userId);

    // ✅ Defensive streak calls — if streakService functions don't exist, default to 0
    let sleepStreak = 0;
    let calorieStreak = 0;
    let moodStreak = 0;

    try {
      const sleepEntries = await SleepEntry.find({ userId });
      if (typeof streakService.calculateStreak === "function") {
        sleepStreak = streakService.calculateStreak(sleepEntries);
      }
    } catch (e) {
      console.warn("sleepStreak error:", e.message);
    }

    try {
      const nutritionEntries = await NutritionEntry.find({ userId });
      if (typeof streakService.calculateGenericStreak === "function") {
        calorieStreak = streakService.calculateGenericStreak(
          nutritionEntries,
          "actualCalories"
        );
      }
    } catch (e) {
      console.warn("calorieStreak error:", e.message);
    }

    try {
      const mentalEntries = await MentalWellnessEntry.find({ userId });
      if (typeof streakService.calculateGenericStreak === "function") {
        moodStreak = streakService.calculateGenericStreak(
          mentalEntries,
          "mood"
        );
      }
    } catch (e) {
      console.warn("moodStreak error:", e.message);
    }

    res.json({
      ...data,
      sleepStreak,
      calorieStreak,
      moodStreak,
    });
  } catch (error) {
    console.error("getDashboard error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET MY ANALYTICS
const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = "30", type = "sleep" } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    if (range === "7") startDate.setDate(today.getDate() - 6);
    else if (range === "15") startDate.setDate(today.getDate() - 14);
    else startDate.setDate(today.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const filter = { userId, date: { $gte: startDate, $lte: today } };

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
      result[date].calories = e.actualCalories || null;
    });

    mental.forEach((e) => {
      const date = formatDate(e.date);
      if (!result[date]) result[date] = { date };
      result[date].mood = e.mood || null;
    });

    const days = parseInt(range);
    const filled = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const formatted = formatDate(d);
      filled.push(
        result[formatted] || {
          date: formatted,
          sleep: null,
          calories: null,
          mood: null,
        }
      );
    }

    const clean = filled.filter(
      (d) => d[type] !== null && d[type] !== undefined
    );
    const insights = generateInsights(clean, type);

    res.json({ data: filled, insights });
  } catch (err) {
    console.error("getMyAnalytics error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getMyAnalytics };
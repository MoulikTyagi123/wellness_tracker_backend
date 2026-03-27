const SleepEntry = require("../models/SleepEntry");
const NutritionEntry = require("../models/NutritionEntry");
const MorningRitual = require("../models/MorningRitual");
const MentalWellnessEntry = require("../models/mentalWellnessEntry");

const getTodayDashboard = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sleep = await SleepEntry.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  const nutrition = await NutritionEntry.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  const ritual = await MorningRitual.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  const mental = await MentalWellnessEntry.findOne({
    userId,
    date: { $gte: today, $lt: tomorrow },
  });

  let sleepHours = null;

  if (sleep) {
    const diff =
      new Date(sleep.actualWakeupTime) - new Date(sleep.actualSleepTime);

    sleepHours = diff / (1000 * 60 * 60);
  }

  // ✅ FIX: REAL DEMO IDS
  const DEMO_USERS = [
    "69c6233df84856e3a6d12872", // demo user
    "69c62372f84856e3a6d12878", // demo admin
  ];

  const isDemoUser = DEMO_USERS.includes(String(userId));

  // ✅ FALLBACK GENERATOR (UNCHANGED)
  const generateFallback = () => ({
    ritualScore: Math.floor(60 + Math.random() * 40),
    sleepHours: Math.floor(6 + Math.random() * 3),
    sleepConsistencyScore: Math.floor(60 + Math.random() * 40),
    consumedCalories: Math.floor(1800 + Math.random() * 600),
    calorieTarget: 2200,
    mood: Math.floor(2 + Math.random() * 3),
    meditationMinutes: Math.floor(5 + Math.random() * 20),
  });

  const fallback = generateFallback();

  return {
    date: today,

    ritualScore:
      ritual?.totalScore ?? (isDemoUser ? fallback.ritualScore : null),

    sleepHours: sleepHours ?? (isDemoUser ? fallback.sleepHours : null),

    sleepConsistencyScore:
      sleep?.sleepConsistencyScore ??
      (isDemoUser ? fallback.sleepConsistencyScore : null),

    consumedCalories:
      nutrition?.actualCalories ??
      (isDemoUser ? fallback.consumedCalories : null),

    calorieTarget:
      nutrition?.targetCalories ?? (isDemoUser ? fallback.calorieTarget : null),

    mood: mental?.mood ?? (isDemoUser ? fallback.mood : null),

    meditationMinutes:
      mental?.meditationMinutes ??
      (isDemoUser ? fallback.meditationMinutes : null),
  };
};

module.exports = { getTodayDashboard };

// ================= CONTROLLER =================

const {
  getTodayDashboard: getTodayDashboardService,
} = require("../services/dashboardService");
const SleepEntryModel = require("../models/SleepEntry");
const NutritionEntryModel = require("../models/NutritionEntry");
const MentalWellnessEntryModel = require("../models/mentalWellnessEntry");
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

    const sleepEntries = await SleepEntryModel.find({ userId });
    const sleepStreak = calculateStreak(sleepEntries);

    const nutritionEntries = await NutritionEntryModel.find({ userId });
    const mentalEntries = await MentalWellnessEntryModel.find({ userId });

    const calorieStreak = calculateGenericStreak(
      nutritionEntries,
      "actualCalories",
    );

    const moodStreak = calculateGenericStreak(mentalEntries, "mood");

    res.json({
      ...data,
      sleepStreak,
      calorieStreak,
      moodStreak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET MY ANALYTICS (UNCHANGED)
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

    const filter = {
      userId,
      date: { $gte: startDate, $lte: today },
    };

    const sleep = await SleepEntryModel.find(filter);
    const nutrition = await NutritionEntryModel.find(filter);
    const mental = await MentalWellnessEntryModel.find(filter);

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
      const existing = result[formatted];

      filled.push(
        existing || {
          date: formatted,
          sleep: null,
          calories: null,
          mood: null,
        },
      );
    }

    const clean = filled.filter((d) => d[type] !== null);

    const insights = generateInsights(clean, type);

    res.json({
      data: filled,
      insights,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getMyAnalytics };

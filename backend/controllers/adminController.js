const SleepEntry = require("../models/SleepEntry");
const NutritionEntry = require("../models/NutritionEntry");
const MorningRitual = require("../models/MorningRitual");
const MentalWellnessEntry = require("../models/mentalWellnessEntry");
const User = require("../models/User");
const { generateInsights } = require("../services/insightService");

// ✅ GET ALL DASHBOARD DATA
const getAllDashboard = async (req, res) => {
  try {
    const sleep = await SleepEntry.find().populate("userId", "name email");
    const nutrition = await NutritionEntry.find().populate(
      "userId",
      "name email",
    );
    const ritual = await MorningRitual.find();
    const mental = await MentalWellnessEntry.find().populate(
      "userId",
      "name email",
    );

    res.json({ sleep, nutrition, ritual, mental });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SINGLE USER
const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ STATS
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({ totalUsers, verifiedUsers, totalAdmins, newUsersToday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE USER ANALYTICS (ADMIN VIEW)
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.id;
    const { range = "30" } = req.query;

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
      const diff = new Date(e.actualWakeupTime) - new Date(e.actualSleepTime);
      result[date].sleep = Number((diff / (1000 * 60 * 60)).toFixed(2));
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

    // ✅ FIX: Always return ALL days in range, null for missing
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
        },
      );
    }

    res.json({ data: filled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ANALYTICS (ALL USERS, ADMIN)
const getAnalytics = async (req, res) => {
  try {
    const { range = "30" } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    if (range === "7") startDate.setDate(today.getDate() - 6);
    else if (range === "15") startDate.setDate(today.getDate() - 14);
    else startDate.setDate(today.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const filter = { date: { $gte: startDate, $lte: today } };

    const sleep = await SleepEntry.find(filter).populate("userId", "name");
    const nutrition = await NutritionEntry.find(filter).populate(
      "userId",
      "name",
    );
    const mental = await MentalWellnessEntry.find(filter).populate(
      "userId",
      "name",
    );

    // ✅ Get all users so we can build full date range for each
    const allUsers = await User.find().select("_id name");

    const result = {};
    const formatDate = (d) => new Date(d).toISOString().split("T")[0];

    sleep.forEach((e) => {
      if (!e.userId) return;
      const date = formatDate(e.date);
      // ✅ FIX: use name as key, not userId — so CSV headers are readable
      const name = e.userId.name;
      if (!result[date]) result[date] = { date };
      const diff = new Date(e.actualWakeupTime) - new Date(e.actualSleepTime);
      result[date][`${name}_sleep`] = Number(
        (diff / (1000 * 60 * 60)).toFixed(2),
      );
    });

    nutrition.forEach((e) => {
      if (!e.userId) return;
      const date = formatDate(e.date);
      const name = e.userId.name;
      if (!result[date]) result[date] = { date };
      result[date][`${name}_calories`] = e.actualCalories || null;
    });

    mental.forEach((e) => {
      if (!e.userId) return;
      const date = formatDate(e.date);
      const name = e.userId.name;
      if (!result[date]) result[date] = { date };
      result[date][`${name}_mood`] = e.mood || null;
    });

    const days = parseInt(range);
    const filled = [];

    // ✅ FIX: Build ALL days in the range — null for missing entries
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const formatted = formatDate(d);
      filled.push(result[formatted] || { date: formatted });
    }

    // ✅ Also send user name map so frontend can map name keys back
    const userMap = {};
    allUsers.forEach((u) => {
      userMap[String(u._id)] = u.name;
    });

    res.json({ data: filled, userMap });
  } catch (err) {
    console.error("ADMIN ANALYTICS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllDashboard,
  getAllUsers,
  getSingleUser,
  getStats,
  getAnalytics,
  getUserAnalytics,
};

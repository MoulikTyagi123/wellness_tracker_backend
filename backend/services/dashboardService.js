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

  return {
    date: today,
    ritualScore: ritual?.totalScore || null,
    sleepHours,
    sleepConsistencyScore: sleep?.sleepConsistencyScore || null,
    consumedCalories: nutrition?.actualCalories || null,
    calorieTarget: nutrition?.targetCalories || null,
    mood: mental?.mood || null,
    meditationMinutes: mental?.meditationMinutes || null,
  };
};

module.exports = { getTodayDashboard };

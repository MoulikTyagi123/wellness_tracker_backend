const mongoose = require("mongoose");
require("dotenv").config();

const SleepEntry = require("./models/SleepEntry");
const NutritionEntry = require("./models/NutritionEntry");
const MentalWellnessEntry = require("./models/mentalWellnessEntry");

// ✅ CHANGE ONLY THIS
const USER_ID = "69be6b4869d09b4594e69a86";

// 🎯 USER BEHAVIOR PROFILE (auto variation)
const USER_TYPE = "stressed";
// try: "fit", "lazy", "night_owl", "disciplined", "stressed"

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// 🔥 PROFILE CONFIG
const profiles = {
  fit: {
    sleepStart: 22,
    wakeStart: 6,
    caloriesBase: 2000,
    moodBase: 4,
  },
  lazy: {
    sleepStart: 1,
    wakeStart: 9,
    caloriesBase: 2800,
    moodBase: 2,
  },
  night_owl: {
    sleepStart: 2,
    wakeStart: 10,
    caloriesBase: 2400,
    moodBase: 3,
  },
  disciplined: {
    sleepStart: 22,
    wakeStart: 5,
    caloriesBase: 2100,
    moodBase: 4,
  },
  stressed: {
    sleepStart: 0,
    wakeStart: 7,
    caloriesBase: 2600,
    moodBase: 2,
  },
  balanced: {
    sleepStart: 23,
    wakeStart: 7,
    caloriesBase: 2200,
    moodBase: 3,
  },
};

const config = profiles[USER_TYPE];

const seed = async () => {
  try {
    for (let i = 1; i <= 30; i++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - i);
      baseDate.setHours(0, 0, 0, 0);

      // 🛌 SLEEP (based on profile)
      const sleepTime = new Date(baseDate);
      sleepTime.setHours(config.sleepStart + Math.floor(Math.random() * 2));

      const wakeTime = new Date(baseDate);
      wakeTime.setDate(wakeTime.getDate() + 1);
      wakeTime.setHours(config.wakeStart + Math.floor(Math.random() * 2));

      await SleepEntry.create({
        userId: USER_ID,
        date: baseDate,
        sleepTime,
        actualSleepTime: sleepTime,
        wakeupTime: wakeTime,
        actualWakeupTime: wakeTime,
        sleepConsistencyScore: Math.floor(60 + Math.random() * 40),
        sleepQuality: Math.floor(4 + Math.random() * 6),
      });

      // 🍽 NUTRITION (profile based)
      await NutritionEntry.create({
        userId: USER_ID,
        date: baseDate,
        goalType: "maintain",

        targetCalories: config.caloriesBase,
        actualCalories:
          config.caloriesBase + Math.floor(Math.random() * 600 - 300),

        targetProtein: 120,
        actualProtein: 80 + Math.floor(Math.random() * 60),

        targetWater: 3000,
        actualWater: 2000 + Math.floor(Math.random() * 1500),

        weight: 65 + Math.random() * 10,
      });

      // 🧠 MENTAL (profile based)
      await MentalWellnessEntry.create({
        userId: USER_ID,
        date: baseDate,

        mood: Math.max(
          1,
          Math.min(5, config.moodBase + Math.floor(Math.random() * 2 - 1)),
        ),

        meditationMinutes: Math.floor(Math.random() * 20),

        breathingSessions: Math.floor(Math.random() * 5),
      });
    }

    console.log("✅ Seeding Completed Successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seed();

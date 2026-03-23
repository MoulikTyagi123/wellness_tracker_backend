const SleepEntry = require("../models/SleepEntry");

const calculateWellnessScore = (data) => {
  let meditationScore = 0;
  let breathingScore = 0;

  if (data.meditationMinutes >= 20) meditationScore = 10;
  else if (data.meditationMinutes >= 10) meditationScore = 7;
  else if (data.meditationMinutes > 0) meditationScore = 4;

  if (data.breathingSessions >= 10) breathingScore = 10;
  else if (data.breathingSessions >= 5) breathingScore = 7;
  else if (data.breathingSessions > 0) breathingScore = 4;

  const moodScore = data.mood * 2;

  return meditationScore + breathingScore + moodScore;
};

module.exports = {
  calculateWellnessScore,
};

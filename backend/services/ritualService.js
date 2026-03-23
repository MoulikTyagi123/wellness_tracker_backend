const MorningRitual = require("../models/MorningRitual");

const calculateScore = (activity) => {
  if (activity.type === "yesno") {
    return activity.actualValue ? 10 : 0;
  }

  if (activity.type === "numeric") {
    if (!activity.goalValue) return 0;
    return Math.min(10, (activity.actualValue / activity.goalValue) * 10);
  }

  if (activity.type === "time") {
    const goal = new Date(`1970-01-01T${activity.goalValue}`);
    const actual = new Date(`1970-01-01T${activity.actualValue}`);

    const diff = (actual - goal) / (1000 * 60);

    if (diff <= 0) return 10;
    if (diff <= 30) return 7;
    if (diff <= 60) return 5;

    return 0;
  }

  return 0;
};

const createRitual = async (data) => {
  const ritual = new MorningRitual(data);

  return await ritual.save();
};

const getRitualByDate = async (userId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return await MorningRitual.findOne({
    userId,
    date: { $gte: start, $lte: end },
  });
};

const updateActivity = async (ritualId, activityId, actualValue) => {
  const ritual = await MorningRitual.findById(ritualId);

  const activity = ritual.activities.id(activityId);

  activity.actualValue = actualValue;
  activity.completed = true;

  activity.score = calculateScore(activity);

  ritual.totalScore = ritual.activities.reduce(
    (sum, act) => sum + act.score,
    0,
  );

  return await ritual.save();
};

const addActivity = async (ritualId, activityData, userId) => {
  const ritual = await MorningRitual.findOne({
    _id: ritualId,
    userId,
  });

  if (!ritual) {
    throw new Error("Ritual not found");
  }

  ritual.activities.push({
    name: activityData.name,
    type: activityData.type,
    goalValue: activityData.goalValue,
    actualValue: activityData.actualValue || null,
    completed: activityData.completed || false,
  });

  await ritual.save();

  return ritual;
};

module.exports = {
  createRitual,
  getRitualByDate,
  updateActivity,
  addActivity,
};

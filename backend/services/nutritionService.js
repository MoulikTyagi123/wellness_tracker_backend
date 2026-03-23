const { GOAL_TYPES } = require("../constants/goalTypes");

const calculateCaloriesScore = (goalType, actual, target) => {
  if (!actual) return 0;

  const ratio = actual / target;

  if (goalType === GOAL_TYPES.CUT) {
    if (ratio >= 0.9 && ratio <= 1) return 10;

    if (ratio >= 0.8 && ratio < 0.9) return 7;

    if (ratio > 1 && ratio <= 1.1) return 4;

    return 1;
  }

  if (goalType === GOAL_TYPES.BULK) {
    if (ratio >= 1 && ratio <= 1.1) return 10;

    if (ratio >= 0.9 && ratio < 1) return 7;

    if (ratio > 1.1) return 4;

    return 1;
  }

  return 5;
};

const calculateProteinScore = (actual, target) => {
  if (!actual) return 0;

  const ratio = actual / target;

  if (ratio >= 1) return 10;
  if (ratio >= 0.8) return 7;
  if (ratio >= 0.6) return 4;

  return 1;
};

const calculateWaterScore = (actual, target) => {
  if (!actual) return 0;

  const ratio = actual / target;

  if (ratio >= 1) return 10;
  if (ratio >= 0.8) return 7;

  return 4;
};

const calculateNutritionScore = (data) => {
  const calorieScore = calculateCaloriesScore(
    data.goalType,
    data.actualCalories,
    data.targetCalories,
  );

  const proteinScore = calculateProteinScore(
    data.actualProtein,
    data.targetProtein,
  );

  const waterScore = calculateWaterScore(data.actualWater, data.targetWater);

  const finalScore = calorieScore * 0.5 + proteinScore * 0.3 + waterScore * 0.2;

  return Math.round(finalScore);
};

module.exports = {
  calculateNutritionScore,
};

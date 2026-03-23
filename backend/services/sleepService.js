const getMinutesDifference = (planned, actual) => {
  const plannedTime = new Date(planned);
  const actualTime = new Date(actual);

  const diffMilliseconds = Math.abs(actualTime - plannedTime);

  return diffMilliseconds / (1000 * 60);
};

const calculateConsistencyScore = (minutesDifference) => {
  if (minutesDifference <= 30) return 10;
  if (minutesDifference <= 60) return 7;
  if (minutesDifference <= 120) return 4;
  return 1;
};

const calculateSleepConsistencyScore = (data) => {
  const sleepDiff = getMinutesDifference(data.sleepTime, data.actualSleepTime);

  const wakeDiff = getMinutesDifference(
    data.wakeupTime, // FIXED FIELD NAME
    data.actualWakeupTime,
  );

  const avgDiff = (sleepDiff + wakeDiff) / 2;

  return calculateConsistencyScore(avgDiff);
};

module.exports = {
  calculateSleepConsistencyScore,
};

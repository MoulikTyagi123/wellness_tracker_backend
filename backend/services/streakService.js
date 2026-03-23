const calculateStreak = (entries) => {
  if (!entries.length) return 0;

  let streak = 1;

  const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);

    const diff = (prev - curr) / (1000 * 60 * 60 * 24);

    if (diff === 1) streak++;
    else break;
  }

  return streak;
};
const calculateGenericStreak = (entries, field) => {
  if (!entries.length) return 0;

  let streak = 1;

  const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);

    const diff = (prev - curr) / (1000 * 60 * 60 * 24);

    if (diff === 1 && sorted[i][field] != null) streak++;
    else break;
  }

  return streak;
};

module.exports = { calculateStreak, calculateGenericStreak };

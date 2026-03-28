const generateInsights = (data, type) => {
  // ✅ FIX: lowered threshold — even 1 entry gives basic insight
  if (!data || data.length === 0) {
    return ["No data available — start logging to see your insights!"];
  }

  const values = data
    .map((d) => d[type])
    .filter((v) => typeof v === "number" && !isNaN(v));

  if (values.length === 0) {
    return ["No valid entries found for this metric."];
  }

  // ✅ Single entry — basic insight
  if (values.length === 1) {
    const val = values[0];
    if (type === "sleep") {
      return [
        val >= 7
          ? `Good start! You slept ${val.toFixed(1)} hrs — keep it up 😴`
          : `You slept ${val.toFixed(1)} hrs — aim for 7+ hrs tonight ⚠️`,
      ];
    }
    if (type === "calories") {
      return [
        val > 2500
          ? `High calorie day: ${val} kcal 🍔`
          : val < 1800
          ? `Low calorie day: ${val} kcal ⚠️`
          : `Balanced day: ${val} kcal ✅`,
      ];
    }
    if (type === "mood") {
      return [
        val >= 4
          ? `Great mood today: ${val}/5 😄`
          : val >= 3
          ? `Stable mood today: ${val}/5 🙂`
          : `Low mood today: ${val}/5 ⚠️`,
      ];
    }
    return [`1 entry recorded.`];
  }

  // ✅ 2+ entries — trend analysis
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const first = values[0];
  const last = values[values.length - 1];

  const insights = [];

  // Trend
  let trend = "stable";
  if (last > first + 0.5) trend = "improving";
  else if (last < first - 0.5) trend = "declining";

  if (trend === "improving") {
    insights.push(`${type.charAt(0).toUpperCase() + type.slice(1)} is improving 📈`);
  } else if (trend === "declining") {
    insights.push(`${type.charAt(0).toUpperCase() + type.slice(1)} is declining 📉`);
  } else {
    insights.push(`${type.charAt(0).toUpperCase() + type.slice(1)} is stable`);
  }

  // Type-specific insight
  if (type === "sleep") {
    if (avg >= 7) {
      insights.push(
        trend === "declining"
          ? `Average ${avg.toFixed(1)} hrs — still good but watch the trend 😴`
          : `Good sleep average: ${avg.toFixed(1)} hrs 😴`
      );
    } else {
      insights.push(
        trend === "improving"
          ? `Average ${avg.toFixed(1)} hrs — improving but still below 7 hrs ⚠️`
          : `Low sleep average: ${avg.toFixed(1)} hrs — aim for 7+ hrs ⚠️`
      );
    }
  }

  if (type === "calories") {
    if (avg > 2500) insights.push(`High average: ${Math.round(avg)} kcal/day 🍔`);
    else if (avg < 1800) insights.push(`Low average: ${Math.round(avg)} kcal/day ⚠️`);
    else insights.push(`Balanced average: ${Math.round(avg)} kcal/day ✅`);
  }

  if (type === "mood") {
    if (avg >= 4) insights.push(`Great average mood: ${avg.toFixed(1)}/5 😄`);
    else if (avg >= 3) insights.push(`Stable average mood: ${avg.toFixed(1)}/5 🙂`);
    else insights.push(`Low average mood: ${avg.toFixed(1)}/5 ⚠️`);
  }

  return insights;
};

module.exports = { generateInsights };
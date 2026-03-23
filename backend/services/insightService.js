const generateInsights = (data, type) => {
  if (!data || data.length < 3) {
    return ["Not enough data"];
  }

  const values = data.map((d) => d[type]).filter((v) => typeof v === "number");

  if (values.length < 3) return ["Not enough valid data"];

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const first = values[0];
  const last = values[values.length - 1];

  const insights = [];

  if (last > first) insights.push(`${type} improving 📈`);
  else if (last < first) insights.push(`${type} declining 📉`);
  else insights.push(`${type} stable`);

  if (type === "sleep") {
    if (avg >= 7) insights.push("Good sleep 😴");
    else insights.push("Low sleep ⚠️");
  }

  if (type === "calories") {
    if (avg > 2500) insights.push("High calories 🍔");
    else if (avg < 1800) insights.push("Low calories ⚠️");
    else insights.push("Balanced diet ✅");
  }

  if (type === "mood") {
    if (avg >= 4) insights.push("Great mood 😄");
    else if (avg >= 3) insights.push("Stable mood 🙂");
    else insights.push("Low mood ⚠️");
  }

  return insights;
};

module.exports = { generateInsights };

import { useEffect, useState } from "react";
import axios from "axios";
import { exportToCSV } from "../utils/exportCSV";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const DEMO_IDS = [
  "69c6233df84856e3a6d12872",
  "69c62372f84856e3a6d12878",
];

// ✅ Client-side insight generator (mirrors backend logic, works on any data size)
const generateLocalInsights = (data, type) => {
  const values = data
    .map((d) => d[type])
    .filter((v) => v !== null && v !== undefined && typeof v === "number" && !isNaN(v));

  if (values.length === 0) {
    return ["No data yet — start logging to see your insights!"];
  }

  if (values.length === 1) {
    const val = values[0];
    if (type === "sleep")
      return [val >= 7 ? `Good start! ${val.toFixed(1)} hrs sleep 😴` : `Only ${val.toFixed(1)} hrs — aim for 7+ ⚠️`];
    if (type === "calories")
      return [val > 2500 ? `High calorie day: ${val} kcal 🍔` : val < 1800 ? `Low calorie day: ${val} kcal ⚠️` : `Balanced: ${val} kcal ✅`];
    if (type === "mood")
      return [val >= 4 ? `Great mood: ${val}/5 😄` : val >= 3 ? `Stable mood: ${val}/5 🙂` : `Low mood: ${val}/5 ⚠️`];
    return [`1 entry recorded.`];
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const first = values[0];
  const last = values[values.length - 1];
  const insights = [];

  let trend = "stable";
  if (last > first + 0.5) trend = "improving";
  else if (last < first - 0.5) trend = "declining";

  const label = type.charAt(0).toUpperCase() + type.slice(1);
  if (trend === "improving") insights.push(`${label} is improving 📈`);
  else if (trend === "declining") insights.push(`${label} is declining 📉`);
  else insights.push(`${label} is stable`);

  if (type === "sleep") {
    if (avg >= 7) insights.push(trend === "declining" ? `Avg ${avg.toFixed(1)} hrs — still good 😴` : `Good avg: ${avg.toFixed(1)} hrs 😴`);
    else insights.push(trend === "improving" ? `Avg ${avg.toFixed(1)} hrs — improving but below 7 ⚠️` : `Low avg: ${avg.toFixed(1)} hrs — aim for 7+ ⚠️`);
  }
  if (type === "calories") {
    if (avg > 2500) insights.push(`High avg: ${Math.round(avg)} kcal/day 🍔`);
    else if (avg < 1800) insights.push(`Low avg: ${Math.round(avg)} kcal/day ⚠️`);
    else insights.push(`Balanced avg: ${Math.round(avg)} kcal/day ✅`);
  }
  if (type === "mood") {
    if (avg >= 4) insights.push(`Great avg mood: ${avg.toFixed(1)}/5 😄`);
    else if (avg >= 3) insights.push(`Stable avg mood: ${avg.toFixed(1)}/5 🙂`);
    else insights.push(`Low avg mood: ${avg.toFixed(1)}/5 ⚠️`);
  }

  return insights;
};

function UserAnalytics() {
  const [safeData, setSafeData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [tab, setTab] = useState("sleep");
  const [range, setRange] = useState("7");

  const user = JSON.parse(localStorage.getItem("user"));
  const isDemoUser = DEMO_IDS.includes(user?._id);

  const generateFallback = () => ({
    sleep: parseFloat((5 + Math.random() * 4).toFixed(2)),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  // ✅ Build full date series for given range
  const buildDateRange = (numDays) => {
    const dates = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/dashboard/my-analytics?range=${range}&type=${tab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const raw = res.data.data || [];
        const serverInsights = res.data.insights || [];

        // ✅ Build full date map from server response
        const byDate = {};
        raw.forEach((item) => { byDate[item.date] = item; });

        // ✅ Fill ALL days in range
        const allDates = buildDateRange(parseInt(range));
        const processed = allDates.map((dateStr) => {
          const item = byDate[dateStr];
          if (isDemoUser) {
            const f = generateFallback();
            return {
              date: dateStr,
              sleep: item?.sleep ?? f.sleep,
              calories: item?.calories ?? f.calories,
              mood: item?.mood ?? f.mood,
            };
          }
          return {
            date: dateStr,
            sleep: item?.sleep ?? null,
            calories: item?.calories ?? null,
            mood: item?.mood ?? null,
          };
        });

        setSafeData(processed);

        // ✅ Always generate insights — from server or locally from the processed data
        const effectiveInsights =
          serverInsights.length > 0 && serverInsights[0] !== "Not enough data"
            ? serverInsights
            : generateLocalInsights(processed, tab);

        setInsights(effectiveInsights);
      } catch (err) {
        console.error(err);

        if (isDemoUser) {
          const allDates = buildDateRange(parseInt(range));
          const fallback = allDates.map((dateStr) => {
            const f = generateFallback();
            return { date: dateStr, ...f };
          });
          setSafeData(fallback);
          setInsights(generateLocalInsights(fallback, tab));
        } else {
          const allDates = buildDateRange(parseInt(range));
          const empty = allDates.map((dateStr) => ({
            date: dateStr, sleep: null, calories: null, mood: null,
          }));
          setSafeData(empty);
          setInsights(["No data available — start logging to see your insights!"]);
        }
      }
    };

    fetchData();
  }, [range, tab]);

  // ✅ CSV filename: e.g. "sleep_7days_analytics.csv"
  const handleDownloadCSV = () => {
    const filename = `${tab}_${range}days_analytics.csv`;
    exportToCSV(safeData, filename);
  };

  const lineColors = { sleep: "#3b82f6", calories: "#10b981", mood: "#f59e0b" };
  const tabLabels = { sleep: "Sleep (hrs)", calories: "Calories", mood: "Mood" };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Analytics</h1>

      {/* Download CSV */}
      <button
        onClick={handleDownloadCSV}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download CSV
      </button>

      {/* Range selector */}
      <div className="flex gap-3 mb-4">
        {["7", "15", "30"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1 rounded font-medium border transition ${
              range === r
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Last {r} Days
          </button>
        ))}
      </div>

      {/* Tab selector */}
      <div className="flex gap-3 mb-6">
        {["sleep", "calories", "mood"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1 rounded font-medium border transition capitalize ${
              tab === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ✅ INSIGHTS — always rendered */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">
          📊 Insights — {tabLabels[tab]}
        </h3>
        {insights.length === 0 ? (
          <p className="text-gray-400 text-sm">Calculating insights...</p>
        ) : (
          <ul className="space-y-1">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                • {insight}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line
              dataKey={tab}
              stroke={lineColors[tab]}
              connectNulls
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserAnalytics;
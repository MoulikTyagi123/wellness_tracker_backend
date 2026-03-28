import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { exportToCSV } from "../utils/exportCSV";
import axios from "axios";
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

// ✅ Client-side insight generator
const generateLocalInsights = (data, type) => {
  const values = data
    .map((d) => d[type])
    .filter((v) => v !== null && v !== undefined && typeof v === "number" && !isNaN(v));

  if (values.length === 0) return ["No data yet for this metric."];

  if (values.length === 1) {
    const val = values[0];
    if (type === "sleep")
      return [val >= 7 ? `Good: ${val.toFixed(1)} hrs sleep 😴` : `Only ${val.toFixed(1)} hrs — aim for 7+ ⚠️`];
    if (type === "calories")
      return [val > 2500 ? `High calorie day: ${val} kcal 🍔` : val < 1800 ? `Low calorie day: ${val} kcal ⚠️` : `Balanced: ${val} kcal ✅`];
    if (type === "mood")
      return [val >= 4 ? `Great mood: ${val}/5 😄` : val >= 3 ? `Stable: ${val}/5 🙂` : `Low mood: ${val}/5 ⚠️`];
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
    if (avg >= 7) insights.push(`Good avg: ${avg.toFixed(1)} hrs 😴`);
    else insights.push(`Low avg: ${avg.toFixed(1)} hrs — aim for 7+ ⚠️`);
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

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [range, setRange] = useState(7);

  const isDemoUser = DEMO_IDS.includes(id);

  const generateFallback = () => ({
    sleep: parseFloat((5 + Math.random() * 4).toFixed(2)),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  // ✅ Build full date series
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
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, analyticsRes] = await Promise.all([
          axios.get(
            `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}/analytics?range=${range}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const rawData = analyticsRes.data.data || [];

        // ✅ Build date map from server response
        const byDate = {};
        rawData.forEach((item) => { byDate[item.date] = item; });

        // ✅ Fill ALL days in range
        const allDates = buildDateRange(range);
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

        setUser(userRes.data);
        setAnalytics(processed);
      } catch (err) {
        console.error(err);

        if (isDemoUser) {
          const allDates = buildDateRange(range);
          const fallback = allDates.map((dateStr) => {
            const f = generateFallback();
            return { date: dateStr, ...f };
          });
          setAnalytics(fallback);
        } else {
          const allDates = buildDateRange(range);
          setAnalytics(allDates.map((dateStr) => ({
            date: dateStr, sleep: null, calories: null, mood: null,
          })));
        }
      }
    };

    fetchAll();
  }, [id, range]);

  // ✅ CSV with proper filename
  const handleDownloadCSV = () => {
    const username = user?.name?.replace(/\s+/g, "_") || "user";
    exportToCSV(analytics, `${username}_${range}days_analytics.csv`);
  };

  // ✅ Render one chart per metric
  const renderMetricChart = (type, label, color) => {
    const insights = generateLocalInsights(analytics, type);

    return (
      <div key={type} className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>

        {/* ✅ Insights for this metric */}
        <div className="mb-3 bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">📊 Insights</p>
          {insights.map((ins, idx) => (
            <p key={idx} className="text-xs text-blue-700">• {ins}</p>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line
              dataKey={type}
              stroke={color}
              name={label}
              connectNulls
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!user && analytics.length === 0) {
    return <h2 className="p-6">Loading...</h2>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {user?.name || "User"} — Analytics
        {isDemoUser && (
          <span className="ml-2 text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded font-normal">
            Demo
          </span>
        )}
      </h1>

      {/* Range selector */}
      <div className="flex gap-3 mb-6">
        {[7, 15, 30].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded font-medium border transition ${
              range === r
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Last {r} Days
          </button>
        ))}
      </div>

      {/* CSV Button */}
      <button
        onClick={handleDownloadCSV}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download CSV
      </button>

      {/* ✅ THREE SEPARATE CHARTS, each with their own insights */}
      {renderMetricChart("sleep", "Sleep (hrs)", "#3b82f6")}
      {renderMetricChart("calories", "Calories", "#10b981")}
      {renderMetricChart("mood", "Mood (1–5)", "#f59e0b")}
    </div>
  );
};

export default UserDetails;
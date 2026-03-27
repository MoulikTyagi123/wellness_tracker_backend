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

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [range, setRange] = useState(7);

  // ✅ MULTI INSIGHTS (sleep + calories + mood)
  const generateInsights = (data) => {
    const result = [];

    const getStats = (key) => {
      const values = data
        .map((d) => d[key])
        .filter((v) => typeof v === "number");

      if (values.length < 3) return null;

      const first = values[0];
      const last = values[values.length - 1];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      let trend = "stable";
      if (last > first) trend = "improving";
      else if (last < first) trend = "declining";

      return { avg, trend };
    };

    const sleep = getStats("sleep");
    const calories = getStats("calories");
    const mood = getStats("mood");

    if (sleep) {
      result.push(`Sleep is ${sleep.trend}`);
      result.push(sleep.avg >= 70 ? "Overall good sleep 😴" : "Sleep needs improvement ⚠️");
    }

    if (calories) {
      result.push(`Calories are ${calories.trend}`);
      if (calories.avg > 2500) result.push("High calorie intake 🍔");
      else if (calories.avg < 1800) result.push("Low calorie intake ⚠️");
      else result.push("Balanced diet ✅");
    }

    if (mood) {
      result.push(`Mood is ${mood.trend}`);
      if (mood.avg >= 4) result.push("Great overall mood 😄");
      else if (mood.avg >= 3) result.push("Stable mood 🙂");
      else result.push("Mood needs attention ⚠️");
    }

    if (result.length === 0) return ["No sufficient data yet"];

    return result;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const analyticsRes = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawData = analyticsRes.data.data || [];

        const dataMap = {};
        rawData.forEach((item) => {
          const key = new Date(item.date).toDateString();
          dataMap[key] = item;
        });

        // ✅ IMPORTANT FIX
        const hasRealData = rawData.length > 0;

        const processed = [];

        for (let i = range - 1; i >= 0; i--) {
          const dateObj = new Date();
          dateObj.setDate(dateObj.getDate() - i);

          const isToday =
            new Date().toDateString() === dateObj.toDateString();

          const key = dateObj.toDateString();
          const existing = dataMap[key];

          let sleep = null;
          let calories = null;
          let mood = null;

          if (existing) {
            sleep = existing.sleep ?? null;
            calories = existing.calories ?? null;
            mood = existing.mood ?? null;
          } else if (!isToday && hasRealData) {
            sleep = null;
            calories = null;
            mood = null;
          }

          processed.push({
            date: dateObj.toISOString(),
            sleep,
            calories,
            mood,
          });
        }

        setUser(userRes.data);
        setAnalytics(processed);
        setInsights(generateInsights(processed));

      } catch (err) {
        console.error(err);

        // ✅ CLEAN EMPTY FALLBACK
        const fallbackData = [];

        for (let i = range - 1; i >= 0; i--) {
          const dateObj = new Date();
          dateObj.setDate(dateObj.getDate() - i);

          fallbackData.push({
            date: dateObj.toISOString(),
            sleep: null,
            calories: null,
            mood: null,
          });
        }

        setAnalytics(fallbackData);
        setInsights(["No data available"]);
      }
    };

    fetchAll();
  }, [id, range]);

  if (!user) return <h2>Loading...</h2>;

  const renderChart = (dataKey, title, color) => (
    <div className="bg-white p-5 rounded-xl shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={analytics}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })
            }
          />

          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {user.name} Analytics
      </h1>

      <div className="flex gap-3 mb-6">
        {[7, 15, 30].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded ${
              range === r ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Last {r} Days
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Insights</h3>
        {insights.map((i, idx) => (
          <p key={idx}>• {i}</p>
        ))}
      </div>

      <button
        onClick={() =>
          exportToCSV(analytics, `${user.name}_analytics.csv`)
        }
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Download CSV
      </button>

      {renderChart("sleep", "Sleep Tracking", "#3b82f6")}
      {renderChart("calories", "Calories Tracking", "#10b981")}
      {renderChart("mood", "Mood Tracking", "#f59e0b")}
    </div>
  );
};

export default UserDetails;
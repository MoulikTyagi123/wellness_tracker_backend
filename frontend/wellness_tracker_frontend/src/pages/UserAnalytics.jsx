import { useEffect, useState } from "react";
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
  LabelList,
} from "recharts";

function UserAnalytics() {
  const [safeData, setSafeData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [tab, setTab] = useState("sleep");
  const [range, setRange] = useState("7");

  const isDemoUser = localStorage.getItem("demoUser") === "true";

  const generateFallback = () => ({
    sleep: Math.floor(60 + Math.random() * 40),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  const generateClientInsights = (data, type) => {
    const values = data
      .map((d) => d[type])
      .filter((v) => typeof v === "number");

    if (values.length < 3) return ["Not enough data"];

    const first = values[0];
    const last = values[values.length - 1];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const result = [];

    if (last > first) result.push(`${type} improving 📈`);
    else if (last < first) result.push(`${type} declining 📉`);
    else result.push(`${type} stable`);

    if (type === "sleep")
      result.push(avg >= 70 ? "Good sleep 😴" : "Low sleep ⚠️");

    if (type === "calories") {
      if (avg > 2500) result.push("High calories 🍔");
      else if (avg < 1800) result.push("Low calories ⚠️");
      else result.push("Balanced diet ✅");
    }

    if (type === "mood") {
      if (avg >= 4) result.push("Great mood 😄");
      else if (avg >= 3) result.push("Stable mood 🙂");
      else result.push("Low mood ⚠️");
    }

    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/dashboard/my-analytics?range=${range}&type=${tab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawData = res.data.data || [];

        const processed = rawData.map((item) => {
          if (isDemoUser) {
            const fallback = generateFallback();
            return {
              date: item.date,
              sleep: item.sleep ?? fallback.sleep,
              calories: item.calories ?? fallback.calories,
              mood: item.mood ?? fallback.mood,
            };
          }

          return {
            date: item.date,
            sleep: item.sleep ?? null,
            calories: item.calories ?? null,
            mood: item.mood ?? null,
          };
        });

        setSafeData(processed);
        setInsights(generateClientInsights(processed, tab));
      } catch (err) {
        console.error(err);

        if (isDemoUser) {
          const fallbackData = Array.from(
            { length: parseInt(range) },
            (_, i) => {
              const fallback = generateFallback();
              return {
                date: new Date(
                  Date.now() - (parseInt(range) - i - 1) * 86400000
                ).toISOString(),
                sleep: fallback.sleep,
                calories: fallback.calories,
                mood: fallback.mood,
              };
            }
          );

          setSafeData(fallbackData);
          setInsights(generateClientInsights(fallbackData, tab));
        } else {
          setSafeData([]);
          setInsights(["No data yet"]);
        }
      }
    };

    fetchData();
  }, [range, tab]);

  const dataKey = tab;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Analytics</h1>

      {/* Insights */}
      <div className="bg-white p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">Insights</h3>
        {insights.map((i, idx) => (
          <p key={idx}>• {i}</p>
        ))}
      </div>

      {/* CSV Download */}
      <button
        onClick={() => exportToCSV(safeData, `${tab}_${range}_days.csv`)}
        className="mb-4 bg-green-600 text-white px-3 py-1 rounded"
      >
        Download CSV
      </button>

      {/* Range Selector */}
      <div className="flex gap-4 mb-4">
        {["7", "15", "30"].map((r) => (
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

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["sleep", "calories", "mood"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded ${
              tab === t ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3b82f6"
            connectNulls
          >
            <LabelList dataKey={dataKey} position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserAnalytics;
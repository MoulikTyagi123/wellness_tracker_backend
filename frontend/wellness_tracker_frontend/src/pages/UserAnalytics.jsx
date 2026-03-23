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
  const [data, setData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [tab, setTab] = useState("sleep");
  const [range, setRange] = useState("7");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
         `http://localhost:5000/api/dashboard/my-analytics?range=${range}&type=${tab}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData(res.data.data || []);
        setInsights(res.data.insights || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [range, tab]);

  // ✅ SAFE DATA (fix null crashes)
  const safeData = data.map((d) => ({
    ...d,
    sleep: d.sleep ?? null,
    calories: d.calories ?? null,
    mood: d.mood ?? null,
  }));

  const renderChart = () => {
    let title = "";

    if (tab === "sleep") title = "Sleep (Hours)";
    else if (tab === "calories") title = "Calories";
    else title = "Mood";

    return (
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <button
  onClick={() => exportToCSV(data, `${tab}_${range}_days.csv`)}
  className="mb-3 bg-green-600 text-white px-3 py-1 rounded"
>
  Download CSV
</button>

        {/* RANGE BUTTONS */}
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

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />

            {/* ✅ DATE FIX */}
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

            {/* ✅ FIXED LINE */}
            <Line
              type="monotone"
              dataKey={tab}
              stroke="#3b82f6"
              strokeWidth={3}
              connectNulls
            >
              <LabelList dataKey={tab} position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Analytics</h1>

      {/* INSIGHTS */}
      <div className="bg-white p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">Insights</h3>
        {insights.length === 0 ? (
          <p>No insights yet</p>
        ) : (
          insights.map((i, idx) => <p key={idx}>• {i}</p>)
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {["sleep", "calories", "mood"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "font-bold" : ""}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {renderChart()}
    </div>
  );
}

export default UserAnalytics;
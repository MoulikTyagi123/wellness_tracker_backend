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

function UserAnalytics() {
  const [safeData, setSafeData] = useState([]);
  const [tab, setTab] = useState("sleep");
  const [range, setRange] = useState("7");

  const DEMO_IDS = [
    "69c6233df84856e3a6d12872",
    "69c62372f84856e3a6d12878",
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  const isDemoUser = DEMO_IDS.includes(user?._id);

  const generateFallback = () => ({
    sleep: Math.floor(60 + Math.random() * 40),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/dashboard/my-analytics?range=${range}&type=${tab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const raw = res.data.data || [];

        const processed = raw.map((item) => {
          if (isDemoUser) {
            const f = generateFallback();
            return {
              date: item.date,
              sleep: item.sleep ?? f.sleep,
              calories: item.calories ?? f.calories,
              mood: item.mood ?? f.mood,
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
      } catch (err) {
        console.error(err);

        if (isDemoUser) {
          const fallback = Array.from({ length: parseInt(range) }, (_, i) => {
            const f = generateFallback();
            return {
              date: new Date(Date.now() - (range - i) * 86400000).toISOString(),
              ...f,
            };
          });

          setSafeData(fallback);
        } else {
          setSafeData([]);
        }
      }
    };

    fetchData();
  }, [range, tab]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Analytics</h1>

      <button
        onClick={() => exportToCSV(safeData, "analytics.csv")}
        className="mb-4 bg-green-600 text-white px-3 py-1 rounded"
      >
        Download CSV
      </button>

      <div className="flex gap-4 mb-4">
        {["7", "15", "30"].map((r) => (
          <button key={r} onClick={() => setRange(r)}>
            Last {r} Days
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        {["sleep", "calories", "mood"].map((t) => (
          <button key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey={tab} stroke="#3b82f6" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserAnalytics;
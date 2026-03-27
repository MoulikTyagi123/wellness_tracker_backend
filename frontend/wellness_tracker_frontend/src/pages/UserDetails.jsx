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

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [range, setRange] = useState(7);

  const isDemoUser = DEMO_IDS.includes(id);

  const generateFallback = () => ({
    sleep: Math.floor(60 + Math.random() * 40),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const analyticsRes = await axios.get(
          `https://wellness-tracker-backend-4if1.onrender.com/api/admin/users/${id}/analytics?range=${range}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawData = analyticsRes.data.data || [];

        const processed = rawData.map((item) => {
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

        setUser(userRes.data);
        setAnalytics(processed);
        setInsights(["Data loaded"]);
      } catch (err) {
        console.error(err);

        if (isDemoUser) {
          const fallbackData = [];

          for (let i = range - 1; i >= 0; i--) {
            const f = generateFallback();
            fallbackData.push({
              date: new Date(
                Date.now() - i * 86400000
              ).toISOString(),
              ...f,
            });
          }

          setAnalytics(fallbackData);
          setInsights(["Demo data"]);
        } else {
          setAnalytics([]);
          setInsights(["No data available"]);
        }
      }
    };

    fetchAll();
  }, [id, range]);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {user.name} Analytics
      </h1>

      <div className="flex gap-3 mb-6">
        {[7, 15, 30].map((r) => (
          <button key={r} onClick={() => setRange(r)}>
            Last {r} Days
          </button>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-white p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Insights</h3>
        {insights.map((i, idx) => (
          <p key={idx}>• {i}</p>
        ))}
      </div>

      {/* ✅ CSV RESTORED */}
      <button
        onClick={() =>
          exportToCSV(analytics, `${user.name}_analytics.csv`)
        }
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Download CSV
      </button>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analytics}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line dataKey="sleep" stroke="#3b82f6" />
          <Line dataKey="calories" stroke="#10b981" />
          <Line dataKey="mood" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserDetails;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {exportToCSV} from "../utils/exportCSV";
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get(
          `http://localhost:5000/api/admin/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

      const analyticsRes = await axios.get(
  `http://localhost:5000/api/admin/users/${id}/analytics`,
  { headers: { Authorization: `Bearer ${token}` } }
);

setAnalytics(analyticsRes.data.data || []);

        setUser(userRes.data);
        setAnalytics(analyticsRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, [id]);

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
      <h1 className="text-2xl font-bold mb-6">{user.name} Analytics</h1>
<button
  onClick={() => exportToCSV(analytics, `${user.name}_analytics.csv`)}
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
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
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [data, setData] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedUsers, setAppliedUsers] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const statsRes = await axios.get(
        "https://wellness-tracker-backend-4if1.onrender.com/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const analyticsRes = await axios.get(
        "https://wellness-tracker-backend-4if1.onrender.com/api/admin/analytics",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(statsRes.data || {});
      setData(analyticsRes.data.data || []);
    } 
    catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);

const getUsers = () => {
  const users = new Set();

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "date" && key.includes("_")) {
        users.add(key.split("_")[0]);
      }
    });
  });

  return Array.from(users);
};
  const users = getUsers();

  // ✅ CHECKBOX HANDLER
  const handleCheckbox = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      if (selectedUsers.length >= 10) {
        alert("Max 10 users allowed");
        return;
      }
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const applySelection = () => {
    setAppliedUsers(selectedUsers);
  };

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const renderChart = (type, title) => (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {appliedUsers.length === 0 ? (
        <p className="text-gray-400 text-center">
          Select users and click "Apply"
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Legend />

            {appliedUsers.map((user, index) => (
              <Line
                key={`${user}_${type}`}
                type="monotone"
                dataKey={`${user}_${type}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
const downloadCSV = () => {
  if (appliedUsers.length === 0) {
    alert("Select users first");
    return;
  }

  const filtered = data.map((row) => {
    const newRow = { date: row.date };

    appliedUsers.forEach((user) => {
      Object.keys(row).forEach((key) => {
        if (key.startsWith(user)) {
          newRow[key] = row[key];
        }
      });
    });

    return newRow;
  });

  exportToCSV(filtered, "admin_selected_users.csv");
};
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <button
  onClick={downloadCSV}
  className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
>
  Download Selected Users CSV
</button>

      {/* CHECKBOX */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-md max-w-md">
        <h3 className="font-semibold mb-3">
          Select Users (max 10)
        </h3>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {users.map((user) => (
            <label key={user} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user)}
                onChange={() => handleCheckbox(user)}
              />
              {user}
            </label>
          ))}
        </div>

        <button
          onClick={applySelection}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Apply Selection
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <p>Total Users</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {stats.totalUsers || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p>Verified Users</p>
          <h2 className="text-2xl font-bold text-green-600">
            {stats.verifiedUsers || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <p>Admins</p>
          <h2 className="text-2xl font-bold text-red-500">
            {stats.totalAdmins || 0}
          </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid gap-6">
        {renderChart("sleep", "Sleep Tracking")}
        {renderChart("calories", "Calories Tracking")}
        {renderChart("mood", "Mood Tracking")}
      </div>
    </div>
  );
}

export default AdminDashboard;
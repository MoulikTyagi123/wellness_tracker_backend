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
  const [data, setData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedUsers, setAppliedUsers] = useState([]);

  const DEMO_IDS = [
    "69c6233df84856e3a6d12872",
    "69c62372f84856e3a6d12878",
  ];

  const generateFallback = () => ({
    sleep: Math.floor(60 + Math.random() * 40),
    calories: Math.floor(1800 + Math.random() * 600),
    mood: Math.floor(2 + Math.random() * 3),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [analyticsRes, usersRes] = await Promise.all([
          axios.get(
            "https://wellness-tracker-backend-4if1.onrender.com/api/admin/analytics",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            "https://wellness-tracker-backend-4if1.onrender.com/api/admin/users",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const raw = analyticsRes.data.data || [];
        const users = usersRes.data.users || [];

        setAllUsers(users);

        const today = new Date().toISOString().split("T")[0];
        if (!raw.some((r) => r.date?.startsWith(today))) {
          raw.push({ date: today });
        }

        const userIds = users.map((u) => u._id);

        const processed = raw.map((row) => {
          const newRow = { date: row.date };

          userIds.forEach((userId) => {
            ["sleep", "calories", "mood"].forEach((type) => {
              const key = `${userId}_${type}`;

              if (row[key] !== undefined && row[key] !== null) {
                newRow[key] = row[key];
              } else if (DEMO_IDS.includes(userId)) {
                newRow[key] = generateFallback()[type];
              } else {
                newRow[key] = null;
              }
            });
          });

          return newRow;
        });

        setData(processed);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleCheckbox = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== userId));
    } else {
      if (selectedUsers.length >= 10) {
        alert("Max 10 users allowed");
        return;
      }
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const applySelection = () => setAppliedUsers(selectedUsers);

  // ✅ CSV BACK (FIXED)
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

  const colors = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"];

  const renderChart = (type, title) => (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {appliedUsers.length === 0 ? (
        <p className="text-gray-400 text-center">
          Select users and click Apply
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            {appliedUsers.map((user, index) => {
              const name =
                allUsers.find((u) => u._id === user)?.name || user;

              return (
                <Line
                  key={`${user}_${type}`}
                  dataKey={`${user}_${type}`}
                  name={name}
                  stroke={colors[index % colors.length]}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ CSV BUTTON RESTORED */}
      <button
        onClick={downloadCSV}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Download CSV
      </button>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-md max-w-md">
        <h3>Select Users (max 10)</h3>

        {allUsers.map((user) => (
          <label key={user._id} className="block">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={() => handleCheckbox(user._id)}
            />
            {user.name}
          </label>
        ))}

        <button
          onClick={applySelection}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Apply
        </button>
      </div>

      <div className="grid gap-6">
        {renderChart("sleep", "Sleep")}
        {renderChart("calories", "Calories")}
        {renderChart("mood", "Mood")}
      </div>
    </div>
  );
}

export default AdminDashboard;
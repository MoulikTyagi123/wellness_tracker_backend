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

const DEMO_IDS = [
  "69c6233df84856e3a6d12872",
  "69c62372f84856e3a6d12878",
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const makeDayFallback = () => ({
  sleep: parseFloat((5 + Math.random() * 4).toFixed(2)),
  calories: Math.floor(1800 + Math.random() * 700),
  mood: Math.floor(2 + Math.random() * 4),
});

const buildDateRange = (numDays) => {
  const dates = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [range, setRange] = useState("7");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedUsers, setAppliedUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [analyticsRes, usersRes] = await Promise.all([
          axios.get(
            `https://wellness-tracker-backend-4if1.onrender.com/api/admin/analytics?range=${range}`,
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

        // Build date→row map from server
        const rawByDate = {};
        raw.forEach((row) => { rawByDate[row.date] = row; });

        // ✅ Always build ALL days for the selected range
        const allDates = buildDateRange(parseInt(range));

        const processed = allDates.map((dateStr) => {
          const row = rawByDate[dateStr] || {};
          const newRow = { date: dateStr };

          users.forEach((user) => {
            const name = user.name;
            const isDemoUser = DEMO_IDS.includes(user._id);

            ["sleep", "calories", "mood"].forEach((type) => {
              const nameKey = `${name}_${type}`;
              const val = row[nameKey];

              if (val !== undefined && val !== null) {
                newRow[nameKey] = val;
              } else if (isDemoUser) {
                // ✅ Demo: unique random value per day per metric
                newRow[nameKey] = makeDayFallback()[type];
              } else {
                newRow[nameKey] = null;
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
  }, [range]);

  const handleCheckbox = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== userId));
      return;
    }
    // ✅ FIX: max 5 users only (5 colours available)
    if (selectedUsers.length >= 5) {
      alert("Only 5 users can be selected at a time");
      return;
    }
    setSelectedUsers([...selectedUsers, userId]);
  };

  const applySelection = () => setAppliedUsers(selectedUsers);

  const downloadCSV = () => {
    if (appliedUsers.length === 0) {
      alert("Select users first");
      return;
    }

    const appliedNames = appliedUsers.map(
      (uid) => allUsers.find((u) => u._id === uid)?.name || uid
    );

    const filtered = data.map((row) => {
      // ✅ FIX: apostrophe prefix so Excel treats date as text, not ##########
      const newRow = { Date: `'${row.date}` };
      appliedNames.forEach((name) => {
        newRow[`${name} - Sleep (hrs)`] = row[`${name}_sleep`] ?? "";
        newRow[`${name} - Calories`] = row[`${name}_calories`] ?? "";
        newRow[`${name} - Mood`] = row[`${name}_mood`] ?? "";
      });
      return newRow;
    });

    exportToCSV(filtered, `admin_${range}days_analytics.csv`);
  };

  const renderChart = (type, title) => (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {appliedUsers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Select users and click Apply to view chart
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {appliedUsers.map((userId, index) => {
              const name = allUsers.find((u) => u._id === userId)?.name || userId;
              return (
                <Line
                  key={`${userId}_${type}`}
                  dataKey={`${name}_${type}`}
                  name={name}
                  stroke={COLORS[index]}
                  connectNulls
                  dot={{ r: 2 }}
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

      {/* ✅ Range selector */}
      <div className="flex gap-3 mb-6">
        {["7", "15", "30"].map((r) => (
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

      {/* CSV button */}
      <button
        onClick={downloadCSV}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download CSV
      </button>

      {/* ✅ User selector — max 5 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-md max-w-md">
        <h3 className="font-semibold mb-1">Select Users</h3>
        <p className="text-xs text-gray-400 mb-3">
          Max 5 users ({selectedUsers.length}/5 selected)
        </p>

        {allUsers.map((user) => (
          <label
            key={user._id}
            className="flex items-center gap-2 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={() => handleCheckbox(user._id)}
              disabled={
                !selectedUsers.includes(user._id) && selectedUsers.length >= 5
              }
            />
            <span
              className={
                !selectedUsers.includes(user._id) && selectedUsers.length >= 5
                  ? "text-gray-400"
                  : ""
              }
            >
              {user.name}
            </span>
            {DEMO_IDS.includes(user._id) && (
              <span className="text-xs text-blue-500 bg-blue-50 px-1 rounded">
                demo
              </span>
            )}
          </label>
        ))}

        <button
          onClick={applySelection}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        {renderChart("sleep", "Sleep (hrs)")}
        {renderChart("calories", "Calories")}
        {renderChart("mood", "Mood")}
      </div>
    </div>
  );
}

export default AdminDashboard;
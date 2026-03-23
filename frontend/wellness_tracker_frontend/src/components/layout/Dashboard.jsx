import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    sleep: 0,
    nutrition: 0,
    wellness: 0,
    ritual: 0,
    health: 0,
    sleepStreak: 0, // ✅ ADD THIS
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: {
            Authorization: token,
          },
        });

        const data = await res.json();

        console.log("DASHBOARD DATA:", data);

        setScores({
          sleep: data.sleepConsistencyScore ?? 0,
          nutrition: data.consumedCalories ?? 0,
          wellness: data.mood ?? 0,
          ritual: data.ritualScore ?? 0,
          sleepStreak: data.sleepStreak ?? 0, // ✅ FIX

          health:
            (data.sleepConsistencyScore ?? 0) +
            (data.ritualScore ?? 0) +
            (data.mood ?? 0),
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        Welcome Back 👋
      </h2>

      {/* Health Score */}
      <div className="bg-blue-600 text-white p-6 rounded-xl mb-6">
        <h3 className="text-lg">Health Score</h3>
        <p className="text-4xl font-bold">{scores.health}</p>

        {/* ✅ STREAK FIXED */}
        <p className="mt-2">🔥 Sleep Streak: {scores.sleepStreak} days</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">

        <div
          onClick={() => navigate("/sleep")}
          className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
        >
          <h3>Sleep</h3>
          <p className="text-2xl font-bold">{scores.sleep}</p>
        </div>

        <div
          onClick={() => navigate("/nutrition")}
          className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
        >
          <h3>Nutrition</h3>
          <p className="text-2xl font-bold">{scores.nutrition}</p>
        </div>

        <div
          onClick={() => navigate("/wellness")}
          className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
        >
          <h3>Wellness</h3>
          <p className="text-2xl font-bold">{scores.wellness}</p>
        </div>

        <div
          onClick={() => navigate("/ritual")}
          className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100"
        >
          <h3>Ritual</h3>
          <p className="text-2xl font-bold">{scores.ritual}</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
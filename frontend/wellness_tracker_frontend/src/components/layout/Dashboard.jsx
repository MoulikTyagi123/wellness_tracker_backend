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
    });
const generateFallback = () => {
  return {
    sleep: Math.floor(60 + Math.random() * 40),        // 60–100
    nutrition: Math.floor(1800 + Math.random() * 600), // 1800–2400
    wellness: Math.floor(2 + Math.random() * 3),       // 2–5
    ritual: Math.floor(50 + Math.random() * 50),       // 50–100
    sleepStreak: Math.floor(2 + Math.random() * 10),   // 2–10
  };
};
    useEffect(() => {

      const fetchDashboard = async () => {
        try {

          const token = localStorage.getItem("token");

          const res = await fetch("http://localhost:5000/api/dashboard", {
            headers: {
              Authorization:token,
            },
          });

          const data = await res.json();

          console.log("DASHBOARD DATA:", data);

   if (!data || Object.keys(data).length === 0) {
  const fallback = generateFallback();

  setScores({
    ...fallback,
    health:
      fallback.sleep +
      fallback.ritual +
      fallback.wellness,
  });

} else {
  const sleep = data.sleepConsistencyScore ?? Math.floor(60 + Math.random() * 40);
  const nutrition = data.consumedCalories ?? Math.floor(1800 + Math.random() * 600);
  const wellness = data.mood ?? Math.floor(2 + Math.random() * 3);
  const ritual = data.ritualScore ?? Math.floor(50 + Math.random() * 50);
  const sleepStreak = data.sleepStreak ?? Math.floor(2 + Math.random() * 10);

  setScores({
    sleep,
    nutrition,
    wellness,
    ritual,
    sleepStreak,
    health: sleep + ritual + wellness, // ✅ correct calculation
  });
}
        } catch (err) {
          console.error(err);
        }
      };

      fetchDashboard();

    }, []);

    return (
      <div className="p-6">

        <h2 className="text-2xl font-bold mb-6">
  Today’s Dashboard 📊
</h2>

        {/* Health Score */}
        <div className="bg-blue-600 text-white p-6 rounded-xl mb-6">
          <h3 className="text-lg">Health Score</h3>
          <p className="text-4xl font-bold">{scores.health}</p>
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
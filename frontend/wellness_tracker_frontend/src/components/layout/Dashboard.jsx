import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    sleep: 0,
    nutrition: 0,
    wellness: 0,
    ritual: 0,
    sleepStreak: 0,
    health: 0,
  });

  // ✅ DEMO FALLBACK (ONLY USED FOR DEMO USERS)
  const generateFallback = () => {
    return {
      sleep: Math.floor(60 + Math.random() * 40),
      nutrition: Math.floor(1800 + Math.random() * 600),
      wellness: Math.floor(2 + Math.random() * 3),
      ritual: Math.floor(50 + Math.random() * 50),
      sleepStreak: Math.floor(2 + Math.random() * 10),
    };
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        const isDemoUser = user?.email?.includes("demo"); // ✅ CONDITION

        const res = await fetch(
          "https://wellness-tracker-backend-4if1.onrender.com/api/dashboard",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const data = await res.json();

        console.log("DASHBOARD DATA:", data);

        // ❌ NEW USER → NO DATA → NO FALLBACK
        if (!data || Object.keys(data).length === 0) {
          if (isDemoUser) {
            // ✅ DEMO USER → SHOW FALLBACK
            const fallback = generateFallback();

            setScores({
              ...fallback,
              health:
                fallback.sleep +
                fallback.ritual +
                fallback.wellness,
            });
          } else {
            // ✅ REAL USER → CLEAN EMPTY STATE
            setScores({
              sleep: 0,
              nutrition: 0,
              wellness: 0,
              ritual: 0,
              sleepStreak: 0,
              health: 0,
            });
          }
        } else {
          // ✅ REAL DATA (NO RANDOM FALLBACK HERE)
          const sleep = data.sleepConsistencyScore ?? 0;
          const nutrition = data.consumedCalories ?? 0;
          const wellness = data.mood ?? 0;
          const ritual = data.ritualScore ?? 0;
          const sleepStreak = data.sleepStreak ?? 0;

          setScores({
            sleep,
            nutrition,
            wellness,
            ritual,
            sleepStreak,
            health: sleep + ritual + wellness,
          });
        }
      } catch (err) {
        console.error(err);

        // ❌ ERROR CASE → ONLY DEMO GETS FALLBACK
        const user = JSON.parse(localStorage.getItem("user"));
        const isDemoUser = user?.email?.includes("demo");

        if (isDemoUser) {
          const fallback = generateFallback();

          setScores({
            ...fallback,
            health:
              fallback.sleep +
              fallback.ritual +
              fallback.wellness,
          });
        } else {
          setScores({
            sleep: 0,
            nutrition: 0,
            wellness: 0,
            ritual: 0,
            sleepStreak: 0,
            health: 0,
          });
        }
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
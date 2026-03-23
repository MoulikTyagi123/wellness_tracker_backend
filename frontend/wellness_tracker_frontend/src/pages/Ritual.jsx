import { useEffect, useState } from "react";

function Ritual() {
  const [activities, setActivities] = useState([]);
  const [ritualId, setRitualId] = useState(null);

  const [newActivity, setNewActivity] = useState({
    name: "",
    type: "yesno",
  });

  // ================= FETCH TODAY =================
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString();

      try {
        const res = await fetch(`http://localhost:5000/api/ritual/${today}`, {
          headers: { Authorization: token },
        });

        const data = await res.json();

        if (data && data.activities) {
          setActivities(data.activities);
          setRitualId(data._id);
        } else {
          setActivities([]);
          setRitualId(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // ================= ADD ACTIVITY =================
  const addActivity = async () => {
    if (!newActivity.name) return alert("Enter name");

    const token = localStorage.getItem("token");

    const activity = {
      name: newActivity.name,
      type: newActivity.type,
      actualValue: newActivity.type === "yesno" ? false : "",
      completed: false,
    };

    try {
      if (ritualId) {
        // ✅ ADD TO EXISTING
        const res = await fetch(
          `http://localhost:5000/api/ritual/${ritualId}/activity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(activity),
          }
        );

        const data = await res.json();
        setActivities(data.activities);
      } else {
        // ✅ CREATE NEW
        const res = await fetch(`http://localhost:5000/api/ritual`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            date: new Date(),
            activities: [activity],
          }),
        });

        const data = await res.json();
        setActivities(data.activities);
        setRitualId(data._id);
      }

      setNewActivity({ name: "", type: "yesno" });
    } catch (err) {
      console.error(err);
      alert("Error adding activity");
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = async (index, value) => {
    const updated = [...activities];
    updated[index].actualValue = value;
    updated[index].completed =
      updated[index].type === "yesno"
        ? value
        : value !== "" && value !== null;

    setActivities(updated);

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:5000/api/ritual/${ritualId}/activity/${updated[index]._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            actualValue: value,
          }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SUBMIT DAY =================
  const submitDay = async () => {
    if (!ritualId) return alert("Nothing to submit");

    alert("Day submitted ✅ (Data already saved live)");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Ritual Tracker 🔥</h2>

      {/* ADD ACTIVITY */}
      <div className="mb-6 p-4 border rounded bg-white shadow">
        <input
          placeholder="Activity Name"
          value={newActivity.name}
          onChange={(e) =>
            setNewActivity({ ...newActivity, name: e.target.value })
          }
          className="p-2 border w-full mb-2"
        />

        <select
          value={newActivity.type}
          onChange={(e) =>
            setNewActivity({ ...newActivity, type: e.target.value })
          }
          className="p-2 border w-full mb-2"
        >
          <option value="yesno">Yes/No</option>
          <option value="numeric">Numeric</option>
          <option value="time">Time</option>
        </select>

        <button
          onClick={addActivity}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Activity
        </button>
      </div>

      {/* TRACK */}
      {activities.map((a, i) => (
        <div key={i} className="mb-4 p-4 border rounded bg-white">
          <p>{a.name}</p>

          {a.type === "yesno" && (
            <input
              type="checkbox"
              checked={a.actualValue || false}
              onChange={(e) => handleChange(i, e.target.checked)}
            />
          )}

          {a.type === "numeric" && (
            <input
              type="number"
              value={a.actualValue || ""}
              onChange={(e) =>
                handleChange(i, e.target.value)
              }
            />
          )}

          {a.type === "time" && (
            <input
              type="time"
              value={a.actualValue || ""}
              onChange={(e) =>
                handleChange(i, e.target.value)
              }
            />
          )}

          <p>
            {a.completed ? "✅ Completed" : "❌ Not Completed"}
          </p>
        </div>
      ))}

      {/* ✅ SUBMIT BUTTON */}
      {activities.length > 0 && (
        <button
          onClick={submitDay}
          className="bg-green-600 text-white px-6 py-2 rounded mt-4"
        >
          Submit Today
        </button>
      )}
    </div>
  );
}

export default Ritual;
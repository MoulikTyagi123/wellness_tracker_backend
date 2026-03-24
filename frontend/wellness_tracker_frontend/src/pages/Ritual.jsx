import { useEffect, useState } from "react";

function Ritual() {
  const [activities, setActivities] = useState([]);
  const [ritualId, setRitualId] = useState(null);

  const [newActivity, setNewActivity] = useState({
    name: "",
    type: "yesno",
    goalValue: "",
  });

  // FETCH TODAY
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const token = localStorage.getItem("token");
        const today = new Date().toISOString();

        const res = await fetch(
          `http://localhost:5000/api/ritual/${today}`,
          {
            headers: { Authorization: token },
          }
        );

        const data = await res.json();

        if (data) {
          setActivities(data.activities || []);
          setRitualId(data._id || null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchToday();
  }, []);

  // ADD ACTIVITY
  const addActivity = async () => {
    if (!newActivity.name) return;

    const token = localStorage.getItem("token");
    let id = ritualId;

    try {
      if (!id) {
        const createRes = await fetch(`http://localhost:5000/api/ritual`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            date: new Date(),
            activities: [],
          }),
        });

        const created = await createRes.json();
        id = created._id;
        setRitualId(id);
      }

      let goal = newActivity.goalValue;

      if (newActivity.type === "numeric") {
        goal = goal === "" ? null : Number(goal);
      }

      if (newActivity.type === "time") {
        goal = goal || null;
      }

      if (newActivity.type === "yesno") {
        goal = goal === "" ? null : goal; // true / false
      }

      const payload = {
        name: newActivity.name,
        type: newActivity.type,
        goalValue: goal,
        actualValue:
          newActivity.type === "yesno" ? false : null,
      };

      const res = await fetch(
        `http://localhost:5000/api/ritual/${id}/activity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setActivities(data.activities);

      setNewActivity({ name: "", type: "yesno", goalValue: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE VALUE
  const handleChange = async (index, value) => {
    const updated = [...activities];
    const activity = updated[index];

    let finalValue = value;

    if (activity.type === "numeric") {
      finalValue = value === "" ? null : Number(value);
    }

    if (activity.type === "time") {
      finalValue = value || null;
    }

    if (activity.type === "yesno") {
      finalValue = Boolean(value);
    }

    activity.actualValue = finalValue;

    setActivities(updated);

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:5000/api/ritual/${ritualId}/activity/${activity._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ actualValue: finalValue }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE ACTIVITY ✅ FIXED
  const deleteActivity = async (activityId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/ritual/${ritualId}/activity/${activityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await res.json();
      setActivities(data.activities);

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // SUBMIT
  const submitDay = () => {
    alert("✅ All activities saved successfully!");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Ritual Tracker 🔥</h2>

      {/* ADD */}
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

        {/* NUMERIC TARGET */}
        {newActivity.type === "numeric" && (
          <input
            type="number"
            placeholder="Target Value"
            value={newActivity.goalValue}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                goalValue: e.target.value,
              })
            }
            className="p-2 border w-full mb-2"
          />
        )}

        {/* TIME TARGET */}
        {newActivity.type === "time" && (
          <input
            type="time"
            value={newActivity.goalValue}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                goalValue: e.target.value,
              })
            }
            className="p-2 border w-full mb-2"
          />
        )}

        {/* YES/NO TARGET ✅ */}
        {newActivity.type === "yesno" && (
          <select
            value={newActivity.goalValue}
            onChange={(e) =>
              setNewActivity({
                ...newActivity,
                goalValue: e.target.value === "true",
              })
            }
            className="p-2 border w-full mb-2"
          >
            <option value="">Select Target</option>
            <option value="true">Yes (Must Do)</option>
            <option value="false">No (Must Avoid)</option>
          </select>
        )}

        <button
          onClick={addActivity}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Activity
        </button>
      </div>

      {/* TRACK */}
      {activities.map((a, i) => (
        <div key={a._id} className="mb-4 p-4 border rounded bg-white">

          <p className="font-semibold">{a.name}</p>

          {/* SHOW TARGET */}
          <p className="text-sm text-gray-600">
            Target:{" "}
            {a.type === "yesno"
              ? a.goalValue === true
                ? "Yes"
                : "No"
              : a.goalValue || "-"}
          </p>

          {/* YES/NO */}
          {a.type === "yesno" && (
            <input
              type="checkbox"
              checked={!!a.actualValue}
              onChange={(e) => handleChange(i, e.target.checked)}
            />
          )}

          {/* NUMERIC */}
          {a.type === "numeric" && (
            <input
              type="number"
              value={a.actualValue ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              className="border p-2 mt-2"
            />
          )}

          {/* TIME */}
          {a.type === "time" && (
            <input
              type="time"
              value={a.actualValue ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              className="border p-2 mt-2"
            />
          )}

          <p className="text-sm mt-1">
            {a.actualValue !== null && a.actualValue !== ""
              ? "✅ Completed"
              : "❌ Not Completed"}
          </p>

          {/* DELETE */}
          <button
            onClick={() => deleteActivity(a._id)}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}

      {/* SUBMIT */}
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
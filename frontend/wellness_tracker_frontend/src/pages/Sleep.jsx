import { useState } from "react";

function Sleep() {

  const [form, setForm] = useState({
    sleepTime: "",
    actualSleepTime: "",
    wakeupTime: "",
    actualWakeupTime: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://wellness-tracker-backend-4if1.onrender.com/api/sleep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ FIX
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Sleep data saved ✅");

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error saving sleep data");
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">Sleep Tracker 😴</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-1">Target Sleep Time</label>
          <input type="datetime-local" name="sleepTime" onChange={handleChange} className="p-2 border rounded w-full" />
        </div>

        <div>
          <label className="block mb-1">Actual Sleep Time</label>
          <input type="datetime-local" name="actualSleepTime" onChange={handleChange} className="p-2 border rounded w-full" />
        </div>

        <div>
          <label className="block mb-1">Target Wakeup Time</label>
          <input type="datetime-local" name="wakeupTime" onChange={handleChange} className="p-2 border rounded w-full" />
        </div>

        <div>
          <label className="block mb-1">Actual Wakeup Time</label>
          <input type="datetime-local" name="actualWakeupTime" onChange={handleChange} className="p-2 border rounded w-full" />
        </div>

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save Sleep
      </button>

    </div>
  );
}

export default Sleep;
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

      const res = await fetch("http://localhost:5000/api/sleep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if(!res.ok) {
        throw new Error(data.message || "Failed to save sleep data");
      }
      console.log("SLEEP SAVED:", data);
      alert("Sleep data saved ✅");

    } catch (err) {
      console.error(err);
      alert("Error saving sleep data");
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">Sleep Tracker 😴</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input
          type="datetime-local"
          name="sleepTime"
          onChange={handleChange}
          className="p-2 border rounded"
        />
        
        <input
          type="datetime-local"
          name="actualSleepTime"
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="datetime-local"
          name="wakeupTime"
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="datetime-local"
          name="actualWakeupTime"
          onChange={handleChange}
          className="p-2 border rounded"
        />

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
import { useState } from "react";

function Wellness() {

  const [form, setForm] = useState({
    meditationMinutes: "",
    breathingSessions: "",
    mood: "",
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

      const res = await fetch("http://localhost:5000/api/mental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // same as others
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      const data = await res.json();
      console.log("WELLNESS SAVED:", data);

      alert("Wellness saved ✅");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        Wellness Tracker 🧠
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          name="meditationMinutes"
          placeholder="Meditation (minutes)"
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="breathingSessions"
          placeholder="Breathing Sessions"
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="mood"
          placeholder="Mood (1-5)"
          onChange={handleChange}
          className="p-2 border rounded"
        />

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded"
      >
        Save Wellness
      </button>

    </div>
  );
}

export default Wellness;
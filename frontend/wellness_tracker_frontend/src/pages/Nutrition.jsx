import { useState } from "react";

function Nutrition() {

  const [form, setForm] = useState({
    targetCalories: "",
    actualCalories: "",
    targetProtein: "",
    actualProtein: "",
    targetWater: "",
    actualWater: "",
    weight: "",
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

      const res = await fetch("http://localhost:5000/api/nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Error saving nutrition");
        return;
      }

      const data = await res.json();
      console.log("NUTRITION SAVED:", data);

      alert("Nutrition saved ✅");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">Nutrition Tracker 🍎</h2>

      <div className="grid grid-cols-2 gap-4">

<select
  name="goalType"
  onChange={handleChange}
  className="p-2 border rounded"
>
  <option value="maintain">Maintain</option>
  <option value="cut">Cut</option>
  <option value="bulk">Bulk</option>
</select>
        <input name="targetCalories" placeholder="Target Calories" onChange={handleChange} className="p-2 border rounded" />
        <input name="actualCalories" placeholder="Actual Calories" onChange={handleChange} className="p-2 border rounded" />

        <input name="targetProtein" placeholder="Target Protein (g)" onChange={handleChange} className="p-2 border rounded" />
        <input name="actualProtein" placeholder="Actual Protein (g)" onChange={handleChange} className="p-2 border rounded" />

        <input name="targetWater" placeholder="Target Water (ml)" onChange={handleChange} className="p-2 border rounded" />
        <input name="actualWater" placeholder="Actual Water (ml)" onChange={handleChange} className="p-2 border rounded" />

        <input name="weight" placeholder="Weight (kg)" onChange={handleChange} className="p-2 border rounded" />

      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
      >
        Save Nutrition
      </button>

    </div>
  );
}

export default Nutrition;
import { useState } from "react";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setLoading(true);

      await registerUser({
        name,
        email,
        password
      });

      // ✅ DO NOT AUTO LOGIN (important)
      alert("Account created successfully! Please login.");

      navigate("/login");

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      // ✅ ALWAYS RESET LOADER
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <div className="bg-white p-8 shadow-md rounded w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

      </div>

    </div>
  );
}

export default Signup;
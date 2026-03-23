import { useState, useContext } from "react";
import { registerUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {

      const data = await registerUser({
        name,
        email,
        password
      });

      login(data);

      navigate("/");

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Signup failed");
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
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Create Account
        </button>

      </div>

    </div>
  );
}

export default Signup;
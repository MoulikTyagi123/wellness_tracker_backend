import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();              // clear storage + context
    navigate("/");         // go to landing page
  };

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        
        {/* 👤 USER NAME */}
        <span className="text-gray-600">
          {user?.name || "User"}
        </span>

        {/* 🚪 LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Navbar;
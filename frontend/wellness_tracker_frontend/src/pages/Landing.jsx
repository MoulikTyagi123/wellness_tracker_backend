import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Landing() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleDemoLogin = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      login(res.data);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Demo login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-gray-800 relative overflow-hidden">

      {/* 🌊 BACKGROUND */}
      <div className="absolute inset-0">

        {/* 🔥 FLOATING BLOBS (SMOOTH ANIMATION) */}
        <div className="absolute w-[700px] h-[700px] bg-[#031A6B]/30 blur-[180px] rounded-full top-[-250px] left-[-200px] animate-floatSlow" />
        <div className="absolute w-[600px] h-[600px] bg-[#033860]/30 blur-[160px] rounded-full top-[20%] right-[-200px] animate-floatMedium" />
        <div className="absolute w-[600px] h-[600px] bg-[#087CA7]/30 blur-[160px] rounded-full bottom-[-250px] left-[20%] animate-floatSlow" />
        <div className="absolute w-[500px] h-[500px] bg-[#05B2DC]/30 blur-[160px] rounded-full bottom-[-200px] right-[10%] animate-floatMedium" />

        {/* ✨ FLOATING PARTICLES */}
        <div className="absolute w-3 h-3 bg-[#05B2DC]/40 rounded-full top-[80%] left-[20%] animate-particle" />
        <div className="absolute w-2 h-2 bg-[#087CA7]/40 rounded-full top-[60%] left-[70%] animate-particle delay-200" />
        <div className="absolute w-4 h-4 bg-[#033860]/30 rounded-full top-[30%] left-[10%] animate-particle delay-500" />
        <div className="absolute w-2 h-2 bg-[#05B2DC]/30 rounded-full top-[50%] left-[40%] animate-particle delay-700" />

        {/* 🌈 SUBTLE MOVING GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#05B2DC]/10 to-transparent animate-gradientMove" />
      </div>

      {/* ✨ CENTER GLOW */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-white/40 blur-[120px] rounded-full" />
      </div>

      {/* 🔥 MAIN */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-32">

        {/* BRAND */}
        <h1 className="text-3xl md:text-4xl font-medium text-gray-500 mb-6">
          Design your life
        </h1>

        {/* HEADLINE */}
        <h2 className="leading-tight mb-6">
          <span className="block text-5xl md:text-6xl font-semibold bg-gradient-to-r from-[#031A6B] via-[#087CA7] to-[#05B2DC] bg-clip-text text-transparent">
            WellTrack  
          </span>
        </h2>

        {/* SUBTEXT */}
        <p className="text-gray-600 text-lg mb-14">
          Small habits. Big clarity.
        </p>

        {/* 🚀 BUTTONS */}
        <div className="flex flex-wrap justify-center gap-6">

          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-[#031A6B] to-[#05B2DC] text-white text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 rounded-full bg-white border border-gray-300 text-lg font-semibold hover:bg-gray-100 hover:shadow-md transition duration-300"
          >
            Login
          </button>

          <button
            onClick={() => handleDemoLogin("demo@user.com", "123456")}
            className="px-10 py-4 rounded-full bg-[#087CA7] text-white text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            Demo User
          </button>

          <button
            onClick={() => handleDemoLogin("demo@admin.com", "123456")}
            className="px-10 py-4 rounded-full bg-[#033860] text-white text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            Demo Admin
          </button>

        </div>

      </div>

      {/* 🔥 CUSTOM ANIMATIONS */}
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
        }

        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }

        @keyframes particle {
          0% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 0.6; }
        }

        @keyframes gradientMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }

        .animate-floatMedium {
          animation: floatMedium 6s ease-in-out infinite;
        }

        .animate-particle {
          animation: particle 4s ease-in-out infinite;
        }

        .animate-gradientMove {
          animation: gradientMove 10s linear infinite;
        }
      `}</style>

    </div>
  );
}

export default Landing;
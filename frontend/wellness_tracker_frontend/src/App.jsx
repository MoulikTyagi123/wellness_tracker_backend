import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./components/layout/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import Sleep from "./pages/Sleep";
import Nutrition from "./pages/Nutrition";
import Wellness from "./pages/Wellness";
import Ritual from "./pages/Ritual";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import UserAnalytics from "./pages/UserAnalytics";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Dashboard />
        </div>
      </div>
    </ProtectedRoute>
  }
/>
<Route
  path="/sleep"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Sleep />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/nutrition"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Nutrition />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/mental"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Wellness />
        </div>
      </div>
    </ProtectedRoute>
  }
/>


<Route
  path="/ritual"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Ritual />
        </div>
      </div>
    </ProtectedRoute>
  }
/>


<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Profile />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <AdminDashboard />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <Users />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users/:id"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <UserDetails />
        </div>
      </div>
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/my-analytics"
  element={
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 min-h-screen">
          <Navbar />
          <UserAnalytics />
        </div>
      </div>
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;
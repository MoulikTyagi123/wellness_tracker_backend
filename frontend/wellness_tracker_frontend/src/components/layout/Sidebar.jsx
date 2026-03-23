import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={styles.sidebar}>
      
      <h2 style={{ marginBottom: "20px" }}>Wellness</h2>

      {/* COMMON */}
      <Link style={styles.link} to="/dashboard">Dashboard</Link>
      <Link style={styles.link} to="/profile">Profile</Link>

      {/* USER */}
      <hr />
      <h4 style={{ color: "#60a5fa" }}>User</h4>
      <Link style={styles.link} to="/sleep">Sleep</Link>
      <Link style={styles.link} to="/nutrition">Nutrition</Link>
      <Link style={styles.link} to="/ritual">Ritual</Link>
      <Link style={styles.link} to="/mental">Wellness</Link>
       <Link style={styles.link} to="/dashboard/my-analytics">My Analytics</Link>
      {/* ADMIN */}
      {user?.role === "admin" && (
        <>
          <hr />
          <h4 style={{ color: "#f87171" }}>Admin</h4>
          <Link style={styles.link} to="/admin">Admin Dashboard</Link>
          <Link style={styles.link} to="/admin/users">Users</Link>
        </>
      )}
    </div>
  );
};

export default Sidebar;

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#1e293b", // 🔥 upgraded color
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    color: "#cbd5f5",
    textDecoration: "none",
  },
};
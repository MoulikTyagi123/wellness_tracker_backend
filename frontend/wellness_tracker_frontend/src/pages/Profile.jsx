import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/me`, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setUser(data);
      setForm({
        name: data.name,
        email: data.email,
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ UPDATE PROFILE
  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setUser(data);
      setEditMode(false);
      alert("Profile updated ✅");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!user) {
    return <h2 style={{ textAlign: "center" }}>No user found</h2>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Profile</h1>

      <div style={styles.card}>
        {/* NAME */}
        <div style={styles.field}>
          <label>Name</label>
          {editMode ? (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p>{user.name}</p>
          )}
        </div>

        {/* EMAIL */}
        <div style={styles.field}>
          <label>Email</label>
          {editMode ? (
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        {/* ROLE */}
        <div style={styles.field}>
          <label>Role</label>
          <p>{user.role}</p>
        </div>

        {/* JOIN DATE */}
        <div style={styles.field}>
          <label>Joined</label>
          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {/* BUTTONS */}
        <div style={styles.buttons}>
          {editMode ? (
            <>
              <button onClick={handleUpdate} style={styles.save}>
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={styles.cancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              style={styles.edit}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    marginBottom: "20px",
  },
  card: {
    width: "400px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    background: "#fff",
  },
  field: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },
  edit: {
    background: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
  save: {
    background: "green",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
  cancel: {
    background: "gray",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
  },
};
 // src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/auth"; // backend URL

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!data.name || !data.email || !data.password) {
      setError("Name, email and password are required");
      setLoading(false);
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const text = await res.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text; }

      if (!res.ok) {
        setError(body?.message || `Signup failed (${res.status})`);
        setLoading(false);
        return;
      }

      // success: backend should have set req.session and returned user
      navigate("/onboarding");
    } catch (err) {
      console.error("Signup fetch error:", err);
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "18px",
    marginBottom: "22px",
    borderRadius: "14px",
    border: "1px solid #D7D5C8",
    background: "#EEEDE4",
    fontSize: "16px",
    outline: "none",
    color: "#2A2A2A",
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px",
    background: "#EB8A2F",
    border: "none",
    borderRadius: "22px",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "600",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E4E9D9", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ width: "520px", background: "#FAF9F0", borderRadius: "24px", padding: "50px", boxShadow: "0px 8px 25px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginBottom: 10, fontSize: "28px", color: "#2A2A2A", fontWeight: "700" }}>Create Your Account</h1>
        <p style={{ marginBottom: 35, color: "#6F6F6F", fontSize: "16px" }}>Join ElderEase and simplify care for your loved ones.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            style={inputStyle}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            style={inputStyle}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            style={inputStyle}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={data.confirmPassword}
            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            style={inputStyle}
            required
          />

          {error && <p style={{ color: "#D32F2F", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>{error}</p>}

          <button type="submit" style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: 25, textAlign: "center", color: "#6F6F6F" }}>
          Already have an account? <Link to="/login" style={{ color: "#EB8A2F", fontWeight: "600" }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}


// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
// API BASE URL from .env (React uses REACT_APP_*)
 

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      let body;
      
      try {
        body = await res.json();
      } catch {
        setError("Server sent invalid response");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(body?.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store logged-in user locally (optional)
      if (body?.user) {
        localStorage.setItem("user", JSON.stringify(body.user));
      }

      // Redirect
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e7ebd5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "480px",
          background: "#faf9ed",
          borderRadius: "22px",
          padding: "40px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ marginBottom: "10px", fontWeight: "700", color: "#1b1b1b", fontSize: "32px" }}>
          Welcome Back
        </h1>

        <p style={{ marginBottom: 30, color: "#5f5f5f", fontSize: "16px" }}>
          Log in to continue your ElderEase journey.
        </p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {loading && (
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 10, width: "60%", background: "#eee", borderRadius: 6 }} />
          </div>
        )}

        {error && (
          <p style={{ color: "crimson", marginTop: 14, textAlign: "center" }}>{error}</p>
        )}

        <p style={{ marginTop: 25, textAlign: "center", color: "#3a3a3a", fontSize: "15px" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#d47a28", fontWeight: "600" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  marginBottom: "22px",
  borderRadius: "14px",
  border: "1px solid #dcd8cd",
  background: "#efeee4",
  fontSize: "16px",
  color: "#3b3b3b",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "16px",
  background: "#e98534",
  border: "none",
  borderRadius: "18px",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "8px",
  boxShadow: "0 4px 12px rgba(233,133,52,0.35)",
};

import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e7ebd5", // soft sage
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "480px",
          background: "#faf9ed", // warm light cream
          borderRadius: "22px",
          padding: "40px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            fontWeight: "700",
            color: "#1b1b1b",
            fontSize: "32px",
          }}
        >
          Welcome Back
        </h1>

        <p style={{ marginBottom: 30, color: "#5f5f5f", fontSize: "16px" }}>
          Log in to continue your ElderEase journey.
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          style={inputStyle}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          style={inputStyle}
        />

        {/* Login button */}
        <button style={buttonStyle}>Log In</button>

        <p
          style={{
            marginTop: 25,
            textAlign: "center",
            color: "#3a3a3a",
            fontSize: "15px",
          }}
        >
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
  background: "#e98534", // warm orange
  border: "none",
  borderRadius: "18px",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "600",
  marginTop: "8px",
  boxShadow: "0 4px 12px rgba(233,133,52,0.35)",
};

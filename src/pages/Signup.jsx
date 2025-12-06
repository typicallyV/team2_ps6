import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f5e5df, #e8f0ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "480px",
          background: "#fff",
          borderRadius: "22px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: 10 }}>Create Your Account</h1>
        <p style={{ marginBottom: 30, opacity: 0.7 }}>
          Join ElderEase and simplify care for your loved ones.
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

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={data.confirmPassword}
          onChange={(e) =>
            setData({ ...data, confirmPassword: e.target.value })
          }
          style={inputStyle}
        />

        {/* Signup button */}
        <button style={buttonStyle}>Sign Up</button>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ff6600" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "20px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  background: "#f8f3ef",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(to right, #ff8a00, #e53e3e)",
  border: "none",
  borderRadius: "30px",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
};

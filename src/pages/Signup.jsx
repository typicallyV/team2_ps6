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
        background: "#E4E9D9", // same background as screenshot
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "520px",
          background: "#FAF9F0", // off-white warm card
          borderRadius: "24px",
          padding: "50px",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.08)", // soft shadow
        }}
      >
        <h1
          style={{
            marginBottom: 10,
            fontSize: "28px",
            color: "#2A2A2A",
            fontWeight: "700",
          }}
        >
          Create Your Account
        </h1>

        <p
          style={{
            marginBottom: 35,
            color: "#6F6F6F",
            fontSize: "16px",
          }}
        >
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
            marginTop: 25,
            textAlign: "center",
            color: "#6F6F6F",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#EB8A2F", fontWeight: "600" }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

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
  background: "#EB8A2F", // solid orange like screenshot
  border: "none",
  borderRadius: "22px",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
  marginTop: "10px",
  fontWeight: "600",
};

import React from "react";
import { useNavigate } from "react-router-dom";
import SetupSteps from "./SetupSteps.jsx";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7faff"
      }}>
        
        <h1 style={{ fontSize: "40px", marginBottom: "20px", color: "#222" }}>
          ElderEase
        </h1>

        <p style={{ fontSize: "18px", maxWidth: "600px", textAlign: "center", color: "#444" }}>
          Your all-in-one digital companion for elderly health, prescriptions,
          reminders, and emergency support.
        </p>

        <button
          onClick={() => navigate("/onboarding")}
          style={{
            marginTop: "30px",
            padding: "12px 30px",
            fontSize: "18px",
            borderRadius: "8px",
            border: "none",
            background: "#4e73ff",
            color: "white",
            cursor: "pointer"
          }}>
          Get Started →
        </button>
      </div>

      <div id="setup">
        <SetupSteps />
      </div>
    </div>
  );
}

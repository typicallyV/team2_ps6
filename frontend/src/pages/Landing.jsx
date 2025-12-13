import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#dee4d1ff",
        minHeight: "100vh",
        fontFamily: "Poppins, Inter, sans-serif",
      }}
    >
      {/* 🌟 TRANSLUCENT NAVBAR */}
      <div
        style={{
          width: "100%",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          background: "rgba(246, 247, 236, 0.6)", // translucent
          backdropFilter: "blur(10px)", // blur
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <h2
          style={{
            fontSize: "28px",
            color: "#E86E23",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ElderEase
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Mic Button */}
          <div
          onClick={() => navigate("/voice-assistant")}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#E86E23",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>
          </div>

          {/* Language */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#D0C6B7",
              padding: "10px 18px",
              borderRadius: "14px",
              cursor: "pointer",
              color: "#3A3A3A",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg> EN
          </div>
        </div>
      </div>

      {/* MAIN HERO SECTION */}
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "140px",
          paddingBottom: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            marginBottom: "20px",
            fontWeight: 700,
            color: "#2B2B2B",
          }}
        >
          ElderEase
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "650px",
            color: "#4A4A4A",
            lineHeight: "1.6",
          }}
        >
          Your all-in-one digital companion for elderly health, prescriptions,
          reminders, and emergency support.
        </p>

         

        {/* Login + Signup */}
        <div
          style={{
            marginTop: "35px",
            display: "flex",
            gap: "20px",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "14px 40px",
              fontSize: "18px",
              borderRadius: "14px",
              border: "1px solid #CFCFCF",
              background: "white",
              cursor: "pointer",
              color: "#3A3A3A",
              fontWeight: 500,
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#E86E23";
              e.target.style.color = "#E86E23";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#CFCFCF";
              e.target.style.color = "#3A3A3A";
            }}
          >
            Log In
          </button>

          <button
            onClick={() => navigate("/signup")}
            style={{
              padding: "14px 40px",
              fontSize: "18px",
              borderRadius: "14px",
              background: "#C5B6A7",
              border: "none",
              cursor: "pointer",
              color: "#3A3A3A",
              fontWeight: 500,
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#B5A697")}
            onMouseLeave={(e) => (e.target.style.background = "#C5B6A7")}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* SETUP STEPS */}
      
    </div>
  );
}

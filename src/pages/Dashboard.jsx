import React from "react";

export default function Dashboard() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#eef3ff",
      padding: "20px"
    }}>
      
      {/* Top Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px"
      }}>
        <h2 style={{ color: "#e67e22", margin: 0 }}>Elder-Ease</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ fontSize: "22px", cursor: "pointer" }}>🔔</span>
          <span style={{ fontSize: "22px", cursor: "pointer" }}>⚙️</span>
        </div>
      </div>

      {/* Emergency Button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <div style={{
          width: "120px",
          height: "120px",
          background: "#ff4d4d",
          borderRadius: "50%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontWeight: "bold"
        }}>
          EMERGENCY
        </div>

        <p style={{ marginTop: "10px", color: "#555" }}>
          This button will alert your emergency contacts.
        </p>
      </div>

      {/* Mood Buttons */}
      <div style={{
        width: "80%",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        margin: "30px auto",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
      }}>
        <h3>How are you feeling today?</h3>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}>
          <button style={moodBtn}>Happy 😊</button>
          <button style={moodBtn}>Okay 🙂</button>
          <button style={moodBtn}>Tired 🥱</button>
          <button style={moodBtn}>Unwell 🤒</button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "25px",
        flexWrap: "wrap",
        marginTop: "40px"
      }}>
        {featureCard("📄", "PRESCRIPTIONS")}
        {featureCard("🎤", "VOICE ASSISTANT")}
        {featureCard("📊", "TRACKER")}
        {featureCard("📅", "CALENDAR")}
      </div>

    </div>
  );
}

const moodBtn = {
  flex: "1 1 150px",
  padding: "12px",
  background: "#f6f7ff",
  borderRadius: "8px",
  border: "none",
  fontSize: "16px",
  cursor: "pointer"
};

function featureCard(icon, text) {
  return (
    <div style={{
      width: "200px",
      height: "140px",
      background: "#f8faff",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        fontSize: "32px",
        marginBottom: "10px"
      }}>
        {icon}
      </div>
      <strong>{text}</strong>
    </div>
  );
}

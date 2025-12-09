import React, { useState } from "react";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript("");
      // TODO: Start speech recognition
      console.log("🎤 Listening...");
    } else {
      // TODO: Stop speech recognition
      console.log("🎤 Stopped listening");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7EC",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, Inter, sans-serif",
      }}
    >
      {/* Navbar */}
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
          background: "rgba(246, 247, 236, 0.6)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: "28px", color: "#E86E23", margin: 0, fontWeight: 700 }}>
          ElderEase
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Mic Button */}
          <div
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
            🌐 EN
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          paddingTop: "140px",
          paddingBottom: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#2B2B2B",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          VOICE ASSISTANT
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "20px",
            color: "#8B7B6F",
            marginBottom: "60px",
            fontWeight: 400,
          }}
        >
          Tap the microphone to speak
        </p>

        {/* Large Mic Button */}
        <button
          onClick={handleMicClick}
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: isListening ? "#D45E1A" : "#E86E23",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "64px",
            cursor: "pointer",
            boxShadow: isListening
              ? "0 0 30px rgba(232, 110, 35, 0.6)"
              : "0 8px 25px rgba(232, 110, 35, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isListening) {
              e.target.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
         <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>
        </button>

        {/* Status Text */}
        <p
          style={{
            marginTop: "60px",
            fontSize: "18px",
            color: "#6B5E54",
            fontWeight: 500,
          }}
        >
          {isListening ? "Listening..." : "How are you feeling today?"}
        </p>

        {/* Transcript Display */}
        {transcript && (
          <div
            style={{
              marginTop: "40px",
              padding: "20px 30px",
              background: "#F0EFE4",
              borderRadius: "12px",
              maxWidth: "500px",
              color: "#2B2B2B",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            <strong>You said:</strong> {transcript}
          </div>
        )}
      </div>
    </div>
  );
}

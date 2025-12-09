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
            🎤
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

          {/* Bell */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            🔔
          </div>

          {/* Settings */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ⚙️
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
          🎤
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

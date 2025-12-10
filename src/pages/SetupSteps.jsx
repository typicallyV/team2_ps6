import React from "react";
import { useNavigate } from "react-router-dom";

export default function SetupSteps() {
  const navigate = useNavigate();

  const flashcards = [
    {
      title: "Tracker",
      desc: "Monitor vital signs and health metrics easily."
    },
    {
      title: "Upload Prescription",
      desc: "Upload prescription images for easy access later."
    },
    {
      title: "Reminder",
      desc: "Set up medicine and appointment reminders."
    },
    {
      title: "Voice Assistant",
      desc: "Enable voice commands for hands-free operation."
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "900px",
        }}
      >
        {flashcards.map((card) => {
          const isTrackerCard = card.title === "Tracker";
          const isPrescriptionCard = card.title === "Upload Prescription";
          const isReminderCard = card.title === "Reminder";
          const isVoiceCard = card.title === "Voice Assistant";
          return (
            <div
              key={card.title}
              onClick={
                isTrackerCard
                  ? () => navigate("/healthmoodmenu")
                  : isPrescriptionCard
                  ? () => navigate("/prescriptions")
                  : isReminderCard
                  ? () => navigate("/reminder")
                  : isVoiceCard
                  ? () => navigate("/voice-assistant")
                  : undefined
              }
              style={{
                width: "210px",
                padding: "25px",
                borderRadius: "12px",
                background: "#f1f6ff",
                boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                textAlign: "center",
                cursor: isTrackerCard || isPrescriptionCard || isReminderCard || isVoiceCard ? "pointer" : "default"
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{card.title}</h3>
              <p style={{ color: "#555" }}>{card.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

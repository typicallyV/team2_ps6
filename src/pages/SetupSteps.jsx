import React from "react";
import { useNavigate } from "react-router-dom";

export default function SetupSteps() {
  const navigate = useNavigate();

  const flashcards = [
    {
      title: "Enter Patient Info",
      desc: "Add basic details like age, medical history, and contact info."
    },
    {
      title: "Upload Prescription",
      desc: "Upload prescription images for easy access later."
    },
    {
      title: "Set Calendar",
      desc: "Add medicine reminders and track checkups."
    }
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
      
      <p style={{ fontSize: "18px", color: "#444", marginBottom: "30px" }}>
        Follow these simple steps to set up ElderEase.
      </p>

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
          const isPatientCard = card.title === "Enter Patient Info";
          const isPrescriptionCard = card.title === "Upload Prescription";
          return (
            <div
              key={card.title}
              onClick={
                isPatientCard
                  ? () => navigate("/onboarding")
                  : isPrescriptionCard
                  ? () => navigate("/prescriptions")
                  : undefined
              }
              style={{
                width: "250px",
                padding: "25px",
                borderRadius: "12px",
                background: "#f1f6ff",
                boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                textAlign: "center",
                cursor: isPatientCard || isPrescriptionCard ? "pointer" : "default"
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

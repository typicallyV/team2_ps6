import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ONBOARDING_KEY = "elderease_onboarding";

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    address: "",
    phone: "",
    emergencyContact: "",
    medicalCondition: "",
    medicines: ""
  });

  const steps = [
    { title: "What's Your Name?", subtitle: "We'd love to know who we're helping", placeholder: "Enter your full name", key: "name" },
    { title: "How Old Are You?", subtitle: "Your age helps us personalise your care", placeholder: "Enter your age", key: "age" },
    { title: "Where Do You Live?", subtitle: "We'll keep your location private & secure", placeholder: "Enter your address", key: "address" },
    { title: "Your Phone Number", subtitle: "For reminders & health alerts", placeholder: "Enter phone number", key: "phone" },
    { title: "Emergency Contact", subtitle: "Who should we contact during emergencies?", placeholder: "Enter their number", key: "emergencyContact" },
    { title: "Any Medical Conditions?", subtitle: "This will help us support you better", placeholder: "E.g. Diabetes, BP, Asthma", key: "medicalCondition" },
    { title: "Your Daily Medicines", subtitle: "We'll remind you on time", placeholder: "Eg. Metformin, Telma, etc.", key: "medicines" }
  ];

  const current = steps[step - 1];

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      // Save onboarding data to localStorage
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(formData));
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E4E9D9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >

      <div
        style={{
          width: "600px",
          background: "#F7F6EB",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "#D4D8C6",
            borderRadius: "10px",
            marginBottom: "25px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${(step / 7) * 100}%`,
              height: "100%",
              background: "#EB8A2F",
              transition: "0.3s ease"
            }}
          ></div>
        </div>

        <p style={{ color: "#6F6F6F", margin: 0 }}>Step {step} of 7</p>

        <h1 style={{ marginTop: "10px", color: "#2A2A2A" }}>{current.title}</h1>
        <p style={{ color: "#6F6F6F", marginTop: "4px" }}>{current.subtitle}</p>

        <input
          type="text"
          placeholder={current.placeholder}
          value={formData[current.key]}
          onChange={(e) =>
            setFormData({ ...formData, [current.key]: e.target.value })
          }
          style={{
            width: "100%",
            padding: "16px 18px",
            marginTop: "25px",
            borderRadius: "14px",
            border: "1px solid #D4D8C6",
            background: "#EEEDE4",
            fontSize: "16px",
            outline: "none"
          }}
        />

        {/* Bottom */}
        <div
          style={{
            marginTop: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >

          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: "12px 26px",
              background: "#FFFFFF",
              border: "1px solid #D4D8C6",
              borderRadius: "18px",
              cursor: step === 1 ? "not-allowed" : "pointer",
              color: "#2A2A2A",
              fontSize: "15px"
            }}
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: s === step ? "#EB8A2F" : "#D4D8C6"
                }}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{
              padding: "12px 26px",
              background: "#EB8A2F",
              color: "white",
              border: "none",
              borderRadius: "18px",
              fontSize: "15px",
              cursor: "pointer"
            }}
          >
            {step === 7 ? "Complete →" : "Next →"}
          </button>

        </div>
      </div>
    </div>
  );
}

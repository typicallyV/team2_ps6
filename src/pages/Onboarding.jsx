import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate(); // ✅ FIXED — now inside component

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
      navigate("/dashboard"); // navigate only at end
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f5e5df, #e8f0ff)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      
      <div style={{
        width: "600px",
        background: "white",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        
        {/* Progress Bar */}
        <div style={{
          height: "5px", background: "#eee",
          borderRadius: "10px", overflow: "hidden",
          marginBottom: "30px"
        }}>
          <div style={{
            width: `${(step / 7) * 100}%`,
            height: "100%",
            background: "linear-gradient(to right, #ff8a00, #e53e3e)"
          }}></div>
        </div>

        <p style={{ opacity: 0.7 }}>Step {step} of 7</p>
        <h1 style={{ marginTop: "10px" }}>{current.title}</h1>
        <p style={{ opacity: 0.6 }}>{current.subtitle}</p>

        {/* Input */}
        <input
          type="text"
          placeholder={current.placeholder}
          value={formData[current.key]}
          onChange={(e) =>
            setFormData({ ...formData, [current.key]: e.target.value })
          }
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "25px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "16px",
            background: "#f8f3ef"
          }}
        />

        {/* Bottom */}
        <div style={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: "10px 20px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "30px",
              cursor: step === 1 ? "not-allowed" : "pointer"
            }}
          >
            ⟵ Back
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: s === step ? "#ff8a00" : "#ddd"
                }}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{
              padding: "10px 25px",
              background: "linear-gradient(to right, #ff8a00, #e53e3e)",
              border: "none",
              color: "white",
              borderRadius: "30px",
              cursor: "pointer"
            }}
          >
            Next ⟶
          </button>
        </div>

      </div>
    </div>
  );
}

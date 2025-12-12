import React, { useState } from "react";

const ONBOARDING_KEY = "elderease_onboarding";
const API_BASE = "http://localhost:5000/api/onboarding/complete"; // FIXED: Added /complete

export default function Onboarding() {
  // Mock navigation for demo - replace with your actual router
  const navigate = (path) => {
    console.log("Would navigate to:", path);
    alert(`Onboarding complete! Would redirect to ${path}`);
  };

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      // Final step - save to backend
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for session cookies
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save onboarding data");
        }

        console.log("✅ Onboarding saved:", data);

        // Also save to localStorage as backup
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(formData));

        // Navigate to dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("❌ Onboarding error:", err);
        setError(err.message);
        
        // Fallback: save to localStorage and continue
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(formData));
        
        // Show error but still navigate after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } finally {
        setLoading(false);
      }
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

        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px 16px",
              borderRadius: "10px",
              marginTop: "15px",
              fontSize: "14px",
              fontWeight: 500
            }}
          >
            ⚠️ {error} (Saving locally and continuing...)
          </div>
        )}

        <input
          type="text"
          placeholder={current.placeholder}
          value={formData[current.key]}
          onChange={(e) =>
            setFormData({ ...formData, [current.key]: e.target.value })
          }
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 18px",
            marginTop: "25px",
            borderRadius: "14px",
            border: "1px solid #D4D8C6",
            background: loading ? "#E8E5DB" : "#EEEDE4",
            fontSize: "16px",
            outline: "none",
            cursor: loading ? "not-allowed" : "text"
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
            disabled={step === 1 || loading}
            style={{
              padding: "12px 26px",
              background: "#FFFFFF",
              border: "1px solid #D4D8C6",
              borderRadius: "18px",
              cursor: (step === 1 || loading) ? "not-allowed" : "pointer",
              color: "#2A2A2A",
              fontSize: "15px",
              opacity: (step === 1 || loading) ? 0.5 : 1
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
            disabled={loading}
            style={{
              padding: "12px 26px",
              background: loading ? "#D4D8C6" : "#EB8A2F",
              color: "white",
              border: "none",
              borderRadius: "18px",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  width: "14px", 
                  height: "14px", 
                  border: "2px solid white",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }}></span>
                Saving...
              </>
            ) : (
              step === 7 ? "Complete →" : "Next →"
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
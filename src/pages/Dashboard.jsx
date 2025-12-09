import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const REMINDERS_KEY = "elderease_reminders";
const ONBOARDING_KEY = "elderease_onboarding";

export default function Dashboard() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  // Load reminders from localStorage on mount and when other pages update
  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem(REMINDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReminders(parsed);
        const completed = {};
        parsed.forEach((r) => {
          completed[r.id] = r.done;
        });
        setCompletedReminders(completed);
      } else {
        setReminders([]);
        setCompletedReminders({});
      }
    };

    load();
    window.addEventListener("remindersUpdated", load);
    return () => window.removeEventListener("remindersUpdated", load);
  }, []);

  // Load onboarding data
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      try {
        setOnboardingData(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading onboarding data:", e);
      }
    }
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = onboardingData?.name || "User";
    if (hour < 12) return `Good Morning, ${name}! `;
    if (hour < 18) return `Good Afternoon, ${name}! `;
    return `Good Evening, ${name}! `;
  };

  // Get today's reminders
  const today = new Date().toISOString().split("T")[0];
  const todaysReminders = reminders.filter((r) => r.date === today);

  const toggleReminder = (id) => {
    setCompletedReminders((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      // Update localStorage and notify other components
      const updatedReminders = reminders.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      );
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
      window.dispatchEvent(new Event("remindersUpdated"));
      return updated;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e7ecd9",
        padding: "20px",
        fontFamily: "Poppins, Inter, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            color: "#d87d28",
            margin: 0,
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          ElderEase
        </h2>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          {/* Voice Button */}
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#d87d28",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
              fontSize: "22px",
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
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            🌐 EN
          </div>

          {/* Notifications */}
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#D0C6B7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            🔔
          </div>

          {/* Settings */}
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#D0C6B7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ⚙️
          </div>
        </div>
      </div>

      {/* Personalized Greeting */}
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto 28px",
          background: "linear-gradient(135deg, #EB8A2F 0%, #D47A1F 100%)",
          padding: "28px",
          borderRadius: "18px",
          color: "#fff",
          boxShadow: "0 6px 20px rgba(235, 138, 47, 0.3)",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>
          {getGreeting()}
        </h2>
        {onboardingData && (
          <p style={{ fontSize: "16px", margin: "8px 0 0 0", opacity: 0.95 }}>
            Age: {onboardingData.age} | Location: {onboardingData.address}
          </p>
        )}
      </div>

      {/* Emergency Button - LARGE with Pulsing Effect */}
      <style>{`
        @keyframes pulse-red {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7), 0 0 20px rgba(255, 77, 77, 0.4);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(255, 77, 77, 0), 0 0 30px rgba(255, 77, 77, 0.6);
          }
        }
        .emergency-btn {
          animation: pulse-red 2s infinite;
        }
      `}</style>

      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "50px" }}>
        <button
          className="emergency-btn"
          style={{
            background: "#FF4D4D",
            color: "white",
            padding: "32px 90px",
            borderRadius: "80px",
            fontWeight: "bold",
            fontSize: "30px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.08)";
            e.target.style.background = "#E63939";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.background = "#FF4D4D";
          }}
        >
          🚨 EMERGENCY
        </button>

        <p style={{ marginTop: "14px", color: "#6F6F6F", fontSize: "16px" }}>
          Press to alert emergency contacts
        </p>
      </div>

      {/* How are you feeling today - COMPACT */}
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto 40px",
          background: "#FAF9F0",
          padding: "28px",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            color: "#2A2A2A",
            marginBottom: "8px",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          How are you feeling?
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginTop: "18px",
          }}
        >
          {/* Happy - Green */}
          <button
            style={{
              padding: "28px 14px",
              background: "#3BA66D",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>😊</div>
            Happy
          </button>

          {/* Okay - Teal */}
          <button
            style={{
              padding: "28px 14px",
              background: "#2C9FA3",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>😐</div>
            Okay
          </button>

          {/* Tired - Orange */}
          <button
            style={{
              padding: "28px 14px",
              background: "#F5A623",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>🥱</div>
            Tired
          </button>

          {/* Unwell - Red */}
          <button
            style={{
              padding: "28px 14px",
              background: "#E85959",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>🤒</div>
            Unwell
          </button>
        </div>
      </div>

      {/* Quick Actions - SAME SIZE AS MOOD */}
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto 40px",
          background: "#FAF9F0",
          padding: "28px",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            color: "#2A2A2A",
            marginBottom: "18px",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Quick Actions
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {/* Call Family - Green */}
          <button
            style={{
              padding: "28px 14px",
              background: "#3BA66D",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "32px" }}>📞</span> Call Family
          </button>

          {/* Medicines - Teal */}
          <button
            style={{
              padding: "28px 14px",
              background: "#2C9FA3",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "32px" }}>💊</span> Medicines
          </button>

          {/* Appointments - Orange */}
          <button
            style={{
              padding: "28px 14px",
              background: "#F5A623",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "32px" }}>📅</span> Appointments
          </button>

          {/* Family - Light Gray */}
          <button
            style={{
              padding: "28px 14px",
              background: "#E8E5DB",
              borderRadius: "14px",
              border: "none",
              color: "#2A2A2A",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "32px" }}>👨‍👩‍👧‍👦</span> Family
          </button>
        </div>
      </div>

      {/* My Health Info */}
      {onboardingData && (onboardingData.medicines || onboardingData.medicalCondition) && (
        <div
          style={{
            maxWidth: "650px",
            margin: "0 auto 40px",
            background: "#FAF9F0",
            padding: "28px",
            borderRadius: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ color: "#2A2A2A", marginBottom: "18px", fontSize: "20px", fontWeight: 600 }}>
            💊 My Health Info
          </h3>

          {onboardingData.medicalCondition && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: "#8B7B6F", fontSize: "14px", margin: "0 0 8px 0", fontWeight: 600 }}>
                Medical Conditions:
              </p>
              <div
                style={{
                  background: "#FEF8F0",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #EDE9DF",
                  color: "#2A2A2A",
                  fontSize: "17px",
                }}
              >
                {onboardingData.medicalCondition}
              </div>
            </div>
          )}

          {onboardingData.medicines && (
            <div>
              <p style={{ color: "#8B7B6F", fontSize: "14px", margin: "0 0 8px 0", fontWeight: 600 }}>
                Daily Medicines:
              </p>
              <div
                style={{
                  background: "#FEF8F0",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #EDE9DF",
                  color: "#2A2A2A",
                  fontSize: "17px",
                }}
              >
                {onboardingData.medicines}
              </div>
            </div>
          )}

          {onboardingData.emergencyContact && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ color: "#8B7B6F", fontSize: "14px", margin: "0 0 8px 0", fontWeight: 600 }}>
                Emergency Contact:
              </p>
              <div
                style={{
                  background: "#FEF8F0",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #EDE9DF",
                  color: "#2A2A2A",
                  fontSize: "17px",
                }}
              >
                {onboardingData.emergencyContact}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Reminders - CLICKABLE */}
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto 40px",
          background: "#FAF9F0",
          padding: "28px",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => navigate("/reminder")}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <h3
            style={{
              color: "#2A2A2A",
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            ⏰ Today's Reminders
          </h3>
          <span
            style={{
              background: "#E8E5DB",
              color: "#2A2A2A",
              padding: "6px 14px",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {
              todaysReminders.filter((r) => completedReminders[r.id]).length
            }
            /
            {todaysReminders.length}
          </span>
        </div>

        {todaysReminders.length === 0 ? (
          <p
            style={{
              color: "#8B7B6F",
              fontSize: "17px",
              textAlign: "center",
              padding: "30px 0",
            }}
          >
            No reminders for today. Tap to add one!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todaysReminders.map((reminder) => (
              <div
                key={reminder.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#F5F3EB",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #EDE9DF",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReminder(reminder.id);
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: completedReminders[reminder.id] ? "#3BA66D" : "#D0C6B7",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {completedReminders[reminder.id] ? "✓" : "○"}
                  </button>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: completedReminders[reminder.id] ? "#A8A8A8" : "#2A2A2A",
                        fontWeight: 600,
                        fontSize: "17px",
                        textDecoration: completedReminders[reminder.id] ? "line-through" : "none",
                      }}
                    >
                      {reminder.title}
                    </p>
                    <p style={{ margin: "6px 0 0 0", color: "#8B7B6F", fontSize: "15px" }}>
                      {reminder.time}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReminder(reminder.id);
                  }}
                  style={{
                    padding: "10px 18px",
                    background: completedReminders[reminder.id] ? "#3BA66D" : "#D9534F",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {completedReminders[reminder.id] ? "✓ Done" : "Done"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Assistant Section */}
      <div
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          background: "#FAF9F0",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            color: "#2A2A2A",
            marginBottom: "10px",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          🎤 Voice Assistant
        </h3>
        <p style={{ color: "#8B7B6F", marginBottom: "24px", fontSize: "16px" }}>
          Press and speak to ask questions
        </p>

        <button
          onClick={() => setIsListening(!isListening)}
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: isListening ? "#2C9FA3" : "#D4D8C6",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "56px",
            cursor: "pointer",
            margin: "0 auto",
            transition: "all 0.3s ease",
            boxShadow: isListening
              ? "0 0 30px rgba(44, 159, 163, 0.5)"
              : "0 4px 12px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            if (!isListening) e.target.style.transform = "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          🎤
        </button>

        <p style={{ marginTop: "18px", color: "#2A2A2A", fontWeight: 600, fontSize: "17px" }}>
          {isListening ? "Listening..." : "Tap to Speak"}
        </p>
      </div>
    </div>
  );
}

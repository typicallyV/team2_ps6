import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const REMINDERS_KEY = "elderease_reminders";
const ONBOARDING_KEY = "elderease_onboarding";
const MOOD_HISTORY_KEY = "elderease_mood_history";

export default function Dashboard() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [lastMoodRecorded, setLastMoodRecorded] = useState(null);
  const [lastMoodEmoji, setLastMoodEmoji] = useState(null);

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

  // Record mood to localStorage
  const recordMood = (moodLabel, moodEmoji) => {
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString();
    
    const moodEntry = {
      id: Date.now(),
      mood: moodLabel,
      emoji: moodEmoji,
      date: today,
      time: time,
      timestamp: new Date().toLocaleString(),
      tags: [],
      notes: "",
    };

    // Get existing mood history
    const storedHistory = localStorage.getItem(MOOD_HISTORY_KEY);
    const moodHistory = storedHistory ? JSON.parse(storedHistory) : [];

    // Add new mood entry
    const updatedHistory = [moodEntry, ...moodHistory];
    localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Update UI feedback with both name and emoji
    setLastMoodRecorded(moodLabel);
    setLastMoodEmoji(moodEmoji);
    
    // Auto-clear message after 3 seconds
    setTimeout(() => {
      setLastMoodRecorded(null);
      setLastMoodEmoji(null);
    }, 3000);
    
    // Notify other components
    window.dispatchEvent(new Event("moodUpdated"));
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = onboardingData?.name || "User";
    if (hour < 12) return `Good Morning, ${name}!`;
    if (hour < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
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

  const handleEmergencyClick = async () => {
  const confirmSend = window.confirm("Send WhatsApp SOS?");
  if (!confirmSend) return;

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => reject(err),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // <-- Added
  );
    });

    const locationLink = `https://maps.google.com?q=${position.lat},${position.lng}`;
    const emergencyNumber = onboardingData?.emergencyContact;

    const response = await fetch("http://localhost:5000/send-sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emergencyNumber,
        locationLink,
      }),
    });

    const data = await response.json();

    if (data.success) alert("🚨 WhatsApp SOS Sent!");
    else alert("Failed to send SOS alert.");
  } catch (error) {
    alert("Error sending SOS alert.");
  }
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
          onClick={() => navigate("/voice-assistant")}
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
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>
            
          </div>

          {/* Greeting in Navbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #EB8A2F 0%, #D47A1F 100%)",
              padding: "10px 18px",
              borderRadius: "12px",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {getGreeting()}
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
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg> EN
          </div>
        </div>
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

      <div style={{ textAlign: "center", marginTop: "80px", marginBottom: "50px" }}>
        
        <button
          className="emergency-btn"
          style={{
            background: "#FF4D4D",
            color: "white",
            padding: "40px 90px",
            borderRadius: "80px",
            fontWeight: "bold",
            fontSize: "30px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onClick={handleEmergencyClick}
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

      {/* How are you feeling today - with mood recording */}
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
            onClick={() => recordMood("Happy", "😊")}
            style={{
              padding: "28px 14px",
              background: "#3BA66D",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>😊</div>
            Happy
          </button>

          {/* Okay - Teal */}
          <button
            onClick={() => recordMood("Okay", "😐")}
            style={{
              padding: "28px 14px",
              background: "#2C9FA3",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>😐</div>
            Okay
          </button>

          {/* Tired - Orange */}
          <button
            onClick={() => recordMood("Tired", "🥱")}
            style={{
              padding: "28px 14px",
              background: "#F5A623",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>🥱</div>
            Tired
          </button>

          {/* Unwell - Red */}
          <button
            onClick={() => recordMood("Unwell", "🤒")}
            style={{
              padding: "28px 14px",
              background: "#E85959",
              borderRadius: "14px",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "26px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>🤒</div>
            Unwell
          </button>
        </div>

        {lastMoodRecorded && (
          <p style={{ marginTop: "16px", fontSize: "16px", color: "#3BA66D", fontWeight: 600, textAlign: "center" }}>
            ✓ {lastMoodEmoji} Your mood "{lastMoodRecorded}" recorded
          </p>
        )}
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
           Voice Assistant
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
        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>
        </button>

        <p style={{ marginTop: "18px", color: "#2A2A2A", fontWeight: 600, fontSize: "17px" }}>
          {isListening ? "Listening..." : "Tap to Speak"}
        </p>
      </div>
    </div>
  );
}

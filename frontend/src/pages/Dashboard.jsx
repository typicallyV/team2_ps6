import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import SetupSteps from "./SetupSteps.jsx";
import { API_BASE } from "../config";
import { REMINDERS_API } from "../config";
import { ONBOARDING_API } from "../config";
const REMINDERS_KEY = "elderease_reminders";
const ONBOARDING_KEY = "elderease_onboarding";
const MOOD_HISTORY_KEY = "elderease_mood_history";

 
 
export default function Dashboard() {
  const navigate = useNavigate();

  // ============= AUTH STATE (from Dashboard 1) =============
  const [user, setUser] = useState(null);
  const [ authChecked, setAuthChecked] = useState(false);
  const [ profileLoading, setProfileLoading] = useState(true);

  // ============= UI STATE (from Dashboard 2) =============
  const [reminders, setReminders] = useState([]);
  const [completedReminders, setCompletedReminders] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const clearTimerRef = useRef(null);
  const [lastMoodRecorded, setLastMoodRecorded] = useState(null);
  const [lastMoodEmoji, setLastMoodEmoji] = useState(null);
  // ============= FETCH PROFILE ON MOUNT (Cookie Auth) =============
  
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
       console.log("🔍 API_BASE:", API_BASE);
    console.log("🔍 Full URL:", `${API_BASE}/api/auth/profile`);
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          method: "GET",
          credentials: "include", // Send cookies
        });

        if (!res.ok) {
          setAuthChecked(true);
          setProfileLoading(false);
          navigate("/login");
          return;
        }

        const body = await res.json();
        setUser(body.user || null);

        try {
        const onboardingRes = await fetch(ONBOARDING_API, {
          method: "GET",
          credentials: "include",
        });

        if (onboardingRes.ok) {
          const onboardingBody = await onboardingRes.json();
          console.log("✅ Onboarding data from backend:", onboardingBody.onboardingData);
          setOnboardingData(onboardingBody.onboardingData);
        } else {
          console.log("⚠️ No backend onboarding data, checking localStorage...");
          // Fallback to localStorage
          const stored = localStorage.getItem(ONBOARDING_KEY);
          if (stored) {
            try {
              const parsedData = JSON.parse(stored);
              console.log("✅ Onboarding data from localStorage:", parsedData);
              setOnboardingData(parsedData);
              
              // Sync to backend
              syncOnboardingToBackend(parsedData);
            } catch (e) {
              console.error("Error parsing localStorage onboarding:", e);
            }
          }
        }
      } catch (onboardingErr) {
        console.error("Error fetching onboarding data:", onboardingErr);
        // Try localStorage as fallback
        const stored = localStorage.getItem(ONBOARDING_KEY);
        if (stored) {
          try {
            setOnboardingData(JSON.parse(stored));
          } catch (e) {
            console.error("Error loading onboarding data:", e);
          }
        }
      }
        setAuthChecked(true);
        setProfileLoading(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setAuthChecked(true);
        setProfileLoading(false);
        navigate("/login");
      }
    };
 const syncOnboardingToBackend = async (data) => {
    try {
      console.log("🔄 Syncing onboarding to backend...");
      const response = await fetch(ONBOARDING_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("✅ Onboarding synced successfully");
      }
    } catch (error) {
      console.error("❌ Failed to sync onboarding:", error);
    }
  };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
//use effect function for fetch reminders 
  useEffect(() => {
  const fetchReminders = async () => {
    console.log("🔍 Dashboard: Fetching reminders...");

    try {
      // CHANGE THIS LINE - use REMINDERS_API instead of API_BASE
      const response = await fetch(REMINDERS_API, {
        credentials: "include",
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched reminders:", data.reminders);
        
        const fetchedReminders = data.reminders || [];
        setReminders(fetchedReminders);

        // Build completed state
        const completed = {};
        fetchedReminders.forEach((r) => {
          completed[r._id] = r.done;
        });
        setCompletedReminders(completed);
      }
    } catch (error) {
      console.error("❌ Error fetching reminders:", error);
    }
  };

  fetchReminders();

  window.addEventListener("remindersUpdated", fetchReminders);
  return () => window.removeEventListener("remindersUpdated", fetchReminders);
}, []);


  // ============= RECORD MOOD =============
  // import { apiFetch } from "./api"; // path as appropriate

const recordMood = async (moodLabel, moodEmoji) => {
  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString();
  const iso = new Date().toISOString();

  const payload = {
    moodLabel,
    moodEmoji,
    dateISO: today,
    time,
    timestamp: iso,
    tags: [],
    notes: "",
  };

  // show UI feedback immediately
  setLastMoodRecorded(moodLabel);
  setLastMoodEmoji(moodEmoji);
  if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  clearTimerRef.current = setTimeout(() => {
    setLastMoodRecorded(null);
    setLastMoodEmoji(null);
    clearTimerRef.current = null;
  }, 3000);

  try {
    // send to server
    const res = await fetch("http://localhost:5000/api/moods", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Server error" }));
      throw err;
    }

    // notify listeners (MoodTrackerPage listens to this)
    window.dispatchEvent(new Event("moodUpdated"));
    return;
  } catch (err) {
    console.error("Failed saving to server, falling back to localStorage", err);
    // fallback to localStorage
    try {
      const storedHistory = localStorage.getItem(MOOD_HISTORY_KEY);
      const moodHistory = storedHistory ? JSON.parse(storedHistory) : [];
      const moodEntry = {
        id: Date.now(),
        mood: moodLabel,
        emoji: moodEmoji,
        date: today,
        time,
        timestamp: iso,
        tags: [],
        notes: "",
      };
      const updatedHistory = [moodEntry, ...moodHistory];
      localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updatedHistory));
      window.dispatchEvent(new Event("moodUpdated"));
    } catch (err2) {
      console.error("Fallback save failed:", err2);
    }
  }
};

  // ============= GREETING (uses backend name OR localStorage) =============
 const getGreeting = () => {
  const hour = new Date().getHours();
  
  // Priority: backend data > localStorage > fallback
  const name = onboardingData?.name || 
               user?.name || 
               user?.email?.split('@')[0] || 
               "User";
               
  if (hour < 12) return `Good Morning, ${name}!`;
  if (hour < 18) return `Good Afternoon, ${name}!`;
  return `Good Evening, ${name}!`;
};

// ============= emergency=============
 

const handleEmergencyClick = async () => {
  // Check if emergency contact exists
  if (!onboardingData?.emergencyContact) {
    alert("⚠️ No emergency contact found!\n\nPlease add an emergency contact in your profile first.");
    return;
  }

  // Confirm before sending
  const confirmSend = window.confirm(
    `Send Emergency SOS to:\n${onboardingData.emergencyContact}?`
  );
  if (!confirmSend) return;

  try {
    // Show loading message
    alert("📍 Getting your location...");

    // Get user's location
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    const locationLink = `https://maps.google.com?q=${position.lat},${position.lng}`;
    const userName = user?.name || onboardingData?.name || "User";

    console.log("📤 Sending SOS...");

    const response = await fetch("http://localhost:5000/send-sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emergencyNumber: onboardingData.emergencyContact,
        locationLink: locationLink,
        userName: userName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }

    const data = await response.json();

    if (data.success) {
      alert(
        `🚨 EMERGENCY SOS SENT!\n\nTo: ${onboardingData.emergencyContact}\n📍 Location shared\n\nHelp is on the way!`
      );
    } else {
      alert("❌ Failed to send SOS: " + (data.error || "Unknown error"));
    }
  } catch (error) {
    console.error("❌ Error:", error);

    if (error.message.includes("User denied")) {
      alert(
        "⚠️ Location permission denied.\n\nPlease allow location access in your browser settings and try again."
      );
    } else if (error.message.includes("Geolocation")) {
      alert("⚠️ Location services not available.\n\nPlease enable GPS and try again.");
    } else if (error.message.includes("Failed to fetch")) {
      alert(
        "⚠️ Cannot connect to server.\n\nMake sure backend is running on port 5000."
      );
    } else {
      alert("❌ Error sending SOS:\n\n" + error.message);
    }
  }
};

  // ============= REMINDERS HELPERS =============
  const today = new Date().toISOString().split("T")[0];
  const todaysReminders = reminders.filter((r) => r.date === today);

  const toggleReminder = async (id) => {
    const reminder = reminders.find((r) => r._id === id);
    if (!reminder) return;

    try {
      const response = await fetch(`${REMINDERS_API} /${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ done: !reminder.done }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setCompletedReminders((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));

        setReminders((prev) =>
          prev.map((r) => (r._id === id ? data.reminder : r))
        );

        // Notify other components
        window.dispatchEvent(new Event("remindersUpdated"));
      } else {
        console.error("Failed to update reminder");
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
    // ============= REMINDERS HELPERS =============
 

console.log("📅 Today:", today);
console.log("📋 All reminders:", reminders);
console.log("📋 Remaining reminders:", todaysReminders);
  };

  // ============= LOGOUT (Cookie + localStorage) =============
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies (browser-side attempt)
    document.cookie.split(";").forEach((c) => {
      document.cookie =
        c.trim().split("=")[0] +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });

    setUser(null);
    navigate("/signup", { replace: true });
  };

  // ============= GET USER INITIALS =============
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

   

  // ============= MAIN DASHBOARD UI =============
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e7ecd9",
        padding: "20px",
        fontFamily: "Poppins, Inter, sans-serif",
      }}
    >
      {/* Animations */}
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

      {/* ============= TOP BAR ============= */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#FFFFFF"
            >
              <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" />
            </svg>
          </div>

          {/* Greeting */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#FFFFFF"
            >
              <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
            </svg>{" "}
            EN
          </div>

          {/* User Avatar */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
            title={user?.email}
          >
            {getUserInitials()}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              background: "#E85959",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#D32F2F";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#E85959";
              e.target.style.transform = "scale(1)";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ============= EMERGENCY BUTTON ============= */}
      <div style={{ textAlign: "center", marginTop: "80px", marginBottom: "50px" }}>
        <button
          className="emergency-btn"
          onClick={handleEmergencyClick}  
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

      {/* ============= HOW ARE YOU FEELING ============= */}
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
          {[
            { label: "Happy", emoji: "😊", color: "#3BA66D" },
            { label: "Okay", emoji: "😐", color: "#2C9FA3" },
            { label: "Tired", emoji: "🥱", color: "#F5A623" },
            { label: "Unwell", emoji: "🤒", color: "#E85959" },
          ].map(({ label, emoji, color }) => (
            <button
              key={label}
              onClick={() => recordMood(label, emoji)}
              style={{
                padding: "28px 14px",
                background: color,
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
              <div style={{ fontSize: "32px", marginBottom: "6px" }}>{emoji}</div>
              {label}
            </button>
          ))}
        </div>

        {lastMoodRecorded && (
          <p
            style={{
              marginTop: "16px",
              fontSize: "16px",
              color: "#3BA66D",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ✓ {lastMoodEmoji} Your mood "{lastMoodRecorded}" recorded
          </p>
        )}
      </div>

      {/* ============= MY HEALTH INFO ============= */}
      {onboardingData &&
        (onboardingData.medicines || onboardingData.medicalCondition) && (
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
              💊 My Health Info
            </h3>

            {onboardingData.medicalCondition && (
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    color: "#8B7B6F",
                    fontSize: "14px",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
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
                <p
                  style={{
                    color: "#8B7B6F",
                    fontSize: "14px",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
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
                <p
                  style={{
                    color: "#8B7B6F",
                    fontSize: "14px",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
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

      {/* ============= TODAY'S REMINDERS ============= */}
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
      {todaysReminders.filter((r) => completedReminders[r._id]).length} /{" "}
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
          key={reminder._id}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flex: 1,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(reminder._id);
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: completedReminders[reminder._id]
                  ? "#3BA66D"
                  : "#D0C6B7",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {completedReminders[reminder._id] ? "✓" : "○"}
            </button>

            <div>
              <p
                style={{
                  margin: 0,
                  color: completedReminders[reminder._id]
                    ? "#A8A8A8"
                    : "#2A2A2A",
                  fontWeight: 600,
                  fontSize: "17px",
                  textDecoration: completedReminders[reminder._id]
                    ? "line-through"
                    : "none",
                }}
              >
                {reminder.title}
              </p>
              <p
                style={{
                  margin: "6px 0 0 0",
                  color: "#8B7B6F",
                  fontSize: "15px",
                }}
              >
                {reminder.time}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleReminder(reminder._id);
            }}
            style={{
              padding: "10px 18px",
              background: completedReminders[reminder._id]
                ? "#3BA66D"
                : "#D9534F",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {completedReminders[reminder._id] ? "✓ Done" : "Done"}
          </button>
        </div>
      ))}
    </div>
  )}
</div>
  {/* ============= VOICE ASSISTANT ============= */}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="48px"
        viewBox="0 -960 960 960"
        width="48px"
        fill="#FFFFFF"
      >
        <path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z" />
      </svg>
    </button>

    <p
      style={{
        marginTop: "18px",
        color: "#2A2A2A",
        fontWeight: 600,
        fontSize: "17px",
      }}
    >
      {isListening ? "Listening..." : "Tap to Speak"}
    </p>
  </div>
  <br></br><br></br><br></br> 
  <div id="setup">
        <SetupSteps /> 
      </div>
</div>
);
}

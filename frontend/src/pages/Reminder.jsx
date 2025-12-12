import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/reminders";

export default function Reminder() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", time: "", date: null });
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reminders from backend
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        credentials: "include", // Important for cookies
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to access reminders");
          return;
        }
        throw new Error("Failed to fetch reminders");
      }
      
      const data = await response.json();
      setReminders(data.reminders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1));
  };

  const handleYearChange = (offset) => {
    const newYear = currentYear + offset;
    setCurrentYear(newYear);
    setCurrentDate(new Date(newYear, currentDate.getMonth()));
  };

  const handleAddReminder = async () => {
    if (newReminder.title && newReminder.time && newReminder.date) {
      const dateObj = newReminder.date;
      const dateStr =
        dateObj.getFullYear() +
        "-" +
        String(dateObj.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(dateObj.getDate()).padStart(2, "0");

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: newReminder.title,
            time: newReminder.time,
            date: dateStr,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Please login to add reminders");
            return;
          }
          throw new Error("Failed to create reminder");
        }

        const data = await response.json();
        setReminders([...reminders, data.reminder]);

        setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
        setCurrentYear(dateObj.getFullYear());

        setNewReminder({ title: "", time: "", date: null });
        setShowAddModal(false);
        setError(null);
      } catch (err) {
        console.error("Error adding reminder:", err);
        setError(err.message);
      }
    }
  };

  const toggleDone = async (id) => {
    const reminder = reminders.find((r) => r._id === id);
    if (!reminder) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ done: !reminder.done }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to update reminders");
          return;
        }
        throw new Error("Failed to update reminder");
      }

      const data = await response.json();
      setReminders(reminders.map((r) => (r._id === id ? data.reminder : r)));
      setError(null);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to delete reminders");
          return;
        }
        throw new Error("Failed to delete reminder");
      }

      setReminders(reminders.filter((r) => r._id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError(err.message);
    }
  };

  const dateStr =
    currentDate.getFullYear() +
    "-" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDate.getDate()).padStart(2, "0");

  const filteredReminders = reminders.filter((r) => {
    const isSameDay = r.date === dateStr;
    if (filter === "done") return isSameDay && r.done;
    if (filter === "pending") return isSameDay && !r.done;
    return isSameDay;
  });

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#E4E9D9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, Inter, sans-serif" }}>
        <p style={{ fontSize: "18px", color: "#2A2A2A", fontWeight: 600 }}>Loading reminders...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#E4E9D9", fontFamily: "Poppins, Inter, sans-serif" }}>
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
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
              <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" />
            </svg>
          </div>

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
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
              <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
            </svg>{" "}
            EN
          </div>
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: "1100px", margin: "100px auto 0", padding: "0 25px" }}>
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 20px", borderRadius: "8px", marginBottom: "20px", fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 25px" }}>
        {/* Calendar Section */}
        <div style={{ background: "#FAF9F0", borderRadius: "18px", padding: "35px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", marginBottom: "35px" }}>
          {/* Year Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <button
              onClick={() => handleYearChange(-1)}
              style={{
                background: "#D4D8C6",
                border: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                color: "#2A2A2A",
              }}
            >
              ← Prev Year
            </button>

            <span style={{ fontSize: "18px", fontWeight: 700, color: "#2A2A2A" }}>{currentYear}</span>

            <button
              onClick={() => handleYearChange(1)}
              style={{
                background: "#D4D8C6",
                border: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                color: "#2A2A2A",
              }}
            >
              Next Year →
            </button>
          </div>

          {/* Month Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <button
              onClick={handlePrevMonth}
              style={{
                background: "#D4D8C6",
                border: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                color: "#2A2A2A",
              }}
            >
              ← Prev
            </button>

            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#2A2A2A", margin: 0 }}>{monthNames[currentDate.getMonth()]}</h3>

            <button
              onClick={handleNextMonth}
              style={{
                background: "#D4D8C6",
                border: "none",
                padding: "12px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                color: "#2A2A2A",
              }}
            >
              Next →
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "14px", marginBottom: "14px" }}>
            {dayNames.map((day) => (
              <div key={day} style={{ textAlign: "center", fontWeight: 700, color: "#8B7B6F", fontSize: "15px" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
            {calendarDays.map((day, idx) => {
              const isCurrentDay = day && day === currentDate.getDate() && currentDate.getMonth() === new Date().getMonth() && currentYear === new Date().getFullYear();
              const dayDateStr = day ? `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const hasReminders = day && reminders.some((r) => r.date === dayDateStr);

              return (
                <button
                  key={idx}
                  onClick={() => day && setCurrentDate(new Date(currentYear, currentDate.getMonth(), day))}
                  style={{
                    padding: "18px 12px",
                    borderRadius: "14px",
                    border: "none",
                    background: isCurrentDay ? "#EB8A2F" : hasReminders ? "#E8E5DB" : "#FFFFFF",
                    color: isCurrentDay ? "#fff" : "#2A2A2A",
                    fontWeight: isCurrentDay ? 700 : 600,
                    fontSize: "16px",
                    cursor: day ? "pointer" : "default",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (day && !isCurrentDay) {
                      e.target.style.background = "#E8E5DB";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day && !isCurrentDay) {
                      e.target.style.background = hasReminders ? "#E8E5DB" : "#FFFFFF";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "35px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "14px 28px",
              background: "#EB8A2F",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#D47A1F";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#EB8A2F";
              e.target.style.transform = "translateY(0)";
            }}
          >
            + Add Reminder
          </button>

          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "14px 28px",
              background: filter === "all" ? "#2C9FA3" : "#D4D8C6",
              color: filter === "all" ? "#fff" : "#2A2A2A",
              border: "none",
              borderRadius: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s ease",
            }}
          >
            All
          </button>

          <button
            onClick={() => setFilter("done")}
            style={{
              padding: "14px 28px",
              background: filter === "done" ? "#3BA66D" : "#D4D8C6",
              color: filter === "done" ? "#fff" : "#2A2A2A",
              border: "none",
              borderRadius: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s ease",
            }}
          >
            Done
          </button>

          <button
            onClick={() => setFilter("pending")}
            style={{
              padding: "14px 28px",
              background: filter === "pending" ? "#F5A623" : "#D4D8C6",
              color: filter === "pending" ? "#fff" : "#2A2A2A",
              border: "none",
              borderRadius: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s ease",
            }}
          >
            Pending
          </button>
        </div>

        {/* Reminders List */}
        <div style={{ background: "#FAF9F0", borderRadius: "18px", padding: "35px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#2A2A2A", margin: "0 0 24px 0" }}>
            {currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </h3>

          {filteredReminders.length === 0 ? (
            <p style={{ color: "#8B7B6F", fontSize: "16px", textAlign: "center", padding: "35px 0" }}>
              No {filter === "done" ? "completed" : filter === "pending" ? "pending" : ""} reminders for this date.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "18px",
                    background: "#F5F3EB",
                    borderRadius: "14px",
                    border: "1px solid #EDE9DF",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    onClick={() => toggleDone(reminder._id)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: reminder.done ? "#3BA66D" : "#D0C6B7",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    {reminder.done ? "✓" : "○"}
                  </button>

                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: reminder.done ? "#A8A8A8" : "#2A2A2A",
                        fontSize: "17px",
                        textDecoration: reminder.done ? "line-through" : "none",
                      }}
                    >
                      {reminder.title}
                    </p>
                    <p style={{ margin: "6px 0 0 0", color: "#8B7B6F", fontSize: "15px" }}>{reminder.time}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(reminder._id)}
                    style={{
                      background: "#D9534F",
                      color: "#fff",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#C9302C";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#D9534F";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "#FAF9F0",
              padding: "40px",
              borderRadius: "18px",
              width: "90%",
              maxWidth: "450px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#2A2A2A", marginBottom: "24px" }}>Add New Reminder</h2>

            <input
              type="text"
              placeholder="Reminder title"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "18px",
                borderRadius: "14px",
                border: "1px solid #D4D8C6",
                background: "#EEEDE4",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <input
              type="time"
              value={newReminder.time}
              onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "18px",
                borderRadius: "14px",
                border: "1px solid #D4D8C6",
                background: "#EEEDE4",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <input
              type="date"
              value={
                newReminder.date
                  ? `${newReminder.date.getFullYear()}-${String(newReminder.date.getMonth() + 1).padStart(2, "0")}-${String(newReminder.date.getDate()).padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => setNewReminder({ ...newReminder, date: new Date(e.target.value) })}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "24px",
                borderRadius: "14px",
                border: "1px solid #D4D8C6",
                background: "#EEEDE4",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "14px" }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#D4D8C6",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#2A2A2A",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#C4C8B6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#D4D8C6";
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAddReminder}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#EB8A2F",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#D47A1F";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#EB8A2F";
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
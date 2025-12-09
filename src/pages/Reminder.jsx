import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const REMINDERS_KEY = "elderease_reminders";

export default function Reminder() {
  const navigate = useNavigate();
 const [currentDate, setCurrentDate] = useState(new Date());
const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState("all"); // "all", "done", "pending"
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", time: "", date: null });
  const [reminders, setReminders] = useState(() => {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [
      { id: 1, title: "Buy a phone", time: "3pm", date: "2025-08-16", done: true },
      { id: 2, title: "Prepare survey", time: "10pm", date: "2025-08-16", done: false },
      { id: 3, title: "Do the laundry", time: "8am", date: "2025-08-16", done: true },
    ];
  });

  // Save to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

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

  const handleAddReminder = () => {
  if (newReminder.title && newReminder.time && newReminder.date) {
  const dateObj = newReminder.date;

  const dateStr =
    dateObj.getFullYear() + "-" +
    String(dateObj.getMonth() + 1).padStart(2, "0") + "-" +
    String(dateObj.getDate()).padStart(2, "0");

  const newEntry = {
    id: Date.now(),
    title: newReminder.title,
    time: newReminder.time,
    date: dateStr,
    done: false,
  };

  const updated = [...reminders, newEntry];
  setReminders(updated);

  localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("remindersUpdated"));

  setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  setCurrentYear(dateObj.getFullYear());

  setNewReminder({ title: "", time: "", date: null });
  setShowAddModal(false);
}
  };
  
  const toggleDone = (id) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
    setReminders(updated);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("remindersUpdated"));
  };

  const dateStr = currentDate.toISOString().split("T")[0];
  const filteredReminders = reminders.filter(r => {
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

  return (
    <div style={{ minHeight: "100vh", background: "#E4E9D9", fontFamily: "Poppins, Inter, sans-serif" }}>
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 35px",
          background: "rgba(244, 242, 235, 0.7)",
          backdropFilter: "blur(8px)",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: "32px", color: "#EB8A2F", margin: 0, fontWeight: 700 }}>
          ElderEase
        </h2>
        <div style={{ fontSize: "28px" }}>📅</div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "35px 25px" }}>
        {/* Calendar Section */}
        <div style={{ background: "#FAF9F0", borderRadius: "18px", padding: "35px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", marginBottom: "35px" }}>
          {/* Year Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
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

            <span style={{ fontSize: "18px", fontWeight: 700, color: "#2A2A2A" }}>
              {currentYear}
            </span>

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

            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#2A2A2A", margin: 0 }}>
              {monthNames[currentDate.getMonth()]}
            </h3>

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
              const isCurrentDay = day && day === currentDate.getDate();
              const dayDateStr = day ? `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const hasReminders = day && reminders.some(r => r.date === dayDateStr);

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
            }}
            onMouseEnter={(e) => (e.target.style.background = "#D47A1F")}
            onMouseLeave={(e) => (e.target.style.background = "#EB8A2F")}
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
                  key={reminder.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "18px",
                    background: "#F5F3EB",
                    borderRadius: "14px",
                    border: "1px solid #EDE9DF",
                  }}
                >
                  <button
                    onClick={() => toggleDone(reminder.id)}
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
                    <p style={{ margin: "6px 0 0 0", color: "#8B7B6F", fontSize: "15px" }}>
                      {reminder.time}
                    </p>
                  </div>

                  <button
                    onClick={() => setReminders(reminders.filter(r => r.id !== reminder.id))}
                    style={{
                      background: "#D9534F",
                      color: "#fff",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
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
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#2A2A2A", marginBottom: "24px" }}>
              Add New Reminder
            </h2>

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
              }}
            />

            <input
              type="date"
              value={newReminder.date ? newReminder.date.toISOString().split("T")[0] : ""}
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

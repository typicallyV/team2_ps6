import React from "react";
import { useNavigate } from "react-router-dom";

export default function HealthMoodMenu() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#DCE4C9", // sage green
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <div style={{ width: "90%", maxWidth: "650px" }}>
        
        <h1
          style={{
            textAlign: "center",
            marginBottom: "35px",
            fontSize: "32px",
            color: "#5A4F45" // dark taupe text
          }}
        >
          Track Your Wellness
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px"
          }}
        >
          
          {/* Health Card */}
          <div
            onClick={() => navigate("/healthtracker")}
            style={{
              flex: 1,
              background: "#F5F5DC", // beige
              padding: "30px",
              borderRadius: "22px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              cursor: "pointer",
              textAlign: "center",
              transition: "0.3s",
              border: "2px solid #B6A28E" // taupe border
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966486.png"
              alt="health"
              style={{ width: "90px", marginBottom: "12px" }}
            />
            <h3 style={{ color: "#5A4F45", fontSize: "22px" }}>
              Health Tracker
            </h3>
            <p style={{ color: "#7c6d5c", fontSize: "15px", marginTop: "8px" }}>
              Track vitals like BP, heart rate and more.
            </p>
          </div>

          {/* Mood Card */}
          <div
            onClick={() => navigate("/moodtracker")}
            style={{
              flex: 1,
              background: "#F5F5DC",
              padding: "30px",
              borderRadius: "22px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
              cursor: "pointer",
              textAlign: "center",
              transition: "0.3s",
              border: "2px solid #B6A28E"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/742/742752.png"
              alt="mood"
              style={{ width: "90px", marginBottom: "12px" }}
            />
            <h3 style={{ color: "#5A4F45", fontSize: "22px" }}>
              Mood Tracker
            </h3>
            <p style={{ color: "#7c6d5c", fontSize: "15px", marginTop: "8px" }}>
              Log your daily mood visually and easily.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Final VoiceAssistant.jsx
 * - Robust parsing (date, time, title) from free-form speech (any order)
 * - Fixes for split "a m" / "p m"
 * - Saves reminders to localStorage with keys: id, title, time, date, done
 */

const REMINDERS_KEY = "elderease_reminders";

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup recognition on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // ---------- helpers ----------
  const MONTHS = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };

  function normalizeText(s) {
    if (!s) return "";
    return s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  // parse explicit dates like "13th december 2025", "dec 13", "13/12/2025", "14-12", "on 13th"
  function parseDateFromText(rawText) {
    if (!rawText) return null;
    let text = normalizeText(rawText);

    // merge split am/pm into single token (not strictly needed here but harmless)
    text = text.replace(/\ba\s*m\b/g, "am").replace(/\bp\s*m\b/g, "pm");

    const today = new Date();

    // 1) numeric formats dd/mm/yyyy or dd-mm-yyyy (assume dd/mm)
    let m = text.match(/(\b\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const year = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 2) "13th december 2025" or "13 december" or "13th of december"
    m = text.match(/(\b\d{1,2})(?:st|nd|rd|th)?(?:\s*(?:of)?\s*)(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:[,\s]*(\d{4}))?/i);
    if (m) {
      const day = parseInt(m[1], 10);
      const monthName = m[2];
      const month = MONTHS[monthName.toLowerCase()];
      const year = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 3) "december 13 2025" or "dec 13"
    m = text.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\b\d{1,2})(?:st|nd|rd|th)?(?:[,\s]*(\d{4}))?/i);
    if (m) {
      const monthName = m[1];
      const day = parseInt(m[2], 10);
      const month = MONTHS[monthName.toLowerCase()];
      const year = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 4) relative keywords
    if (/\btoday\b/.test(text)) return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (/\btomorrow\b/.test(text)) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (/\b(day after tomorrow|day after)\b/.test(text)) {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (/\byesterday\b/.test(text)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    // 5) "on 13th" with no month -> assume current month and roll to next month if already passed
    m = text.match(/(?:\bon\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\b(?!\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)))/i);
    if (m) {
      const day = parseInt(m[1], 10);
      let candidate = new Date(today.getFullYear(), today.getMonth(), day);
      if (candidate.getDate() === day) {
        const now = new Date();
        if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          // assume next month
          let month = candidate.getMonth() + 1;
          let year = candidate.getFullYear();
          if (month > 11) {
            month = 0;
            year += 1;
          }
          candidate = new Date(year, month, day);
        }
        return new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
      }
    }

    return null;
  }

  // parse time: returns { hour, minute, raw } or null
  function parseTimeFromText(rawText) {
    if (!rawText) return null;
    let text = normalizeText(rawText);

    // FIX: merge broken "a m" / "p m" into "am" / "pm"
    text = text.replace(/\ba\s*m\b/g, "am").replace(/\bp\s*m\b/g, "pm");

    // 1) HH:MM
    let m = text.match(/\b(\d{1,2}):(\d{2})\b/);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      if (/\b(am|pm|a\.m\.|p\.m\.)\b/.test(text)) {
        const ampm = text.match(/\b(am|pm|a\.m\.|p\.m\.)\b/)[1];
        if (/p/i.test(ampm) && h < 12) h += 12;
        if (/a/i.test(ampm) && h === 12) h = 0;
      }
      return { hour: h, minute: min, raw: m[0] };
    }

    // 2) "5 pm", "5 p.m.", "5pm", "5 p m"
    m = text.match(/\b(\d{1,2})(?:\s*(?:[:\.]\s*\d{2}))?\s*(a\.m\.|p\.m\.|am|pm|a m|p m)?\b/);
    if (m) {
      let hour = parseInt(m[1], 10);
      let minute = 0;
      let ampm = m[2] ? m[2].replace(/\s+/g, "").replace(/\./g, "") : null; // "p m" -> "pm"
      if (ampm) {
        if (ampm.toLowerCase().includes("p")) {
          if (hour < 12) hour += 12;
        } else if (ampm.toLowerCase().includes("a")) {
          if (hour === 12) hour = 0;
        }
      } else {
        // check contextual words
        if (/\b(in the|this)?\s*(evening|night|afternoon)\b/.test(text)) {
          hour = (hour % 12) + 12;
        } else if (/\bmorning\b/.test(text)) {
          if (hour === 12) hour = 0;
        } else {
          // no AM/PM hint -> leave hour as is (we'll display as AM/PM later)
        }
      }
      return { hour, minute, raw: m[0] };
    }

    // 3) words like "five in the evening"
    const smallNums = {
      one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12
    };
    m = text.match(new RegExp(`\\b(${Object.keys(smallNums).join("|")})\\b(?:\\s*(in the)?\\s*(morning|evening|night|afternoon))?`));
    if (m) {
      let hour = smallNums[m[1]];
      const part = m[3];
      if (part && (part === "evening" || part === "night" || part === "afternoon")) hour = (hour % 12) + 12;
      return { hour, minute: 0, raw: m[0] };
    }

    return null;
  }

  // improved title extractor
  function extractTitleFromText(originalText, dateObj, timeRaw) {
    if (!originalText) return "Reminder";
    let s = " " + originalText.toLowerCase() + " ";

    // merge split am/pm
    s = s.replace(/\ba\s*m\b/g, "am").replace(/\bp\s*m\b/g, "pm");

    // Remove numeric date formats
    s = s.replace(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/g, " ");

    // Remove patterns like "13th december", "13 december", "13th of december"
    s = s.replace(/\b\d{1,2}(st|nd|rd|th)?(?:\s*(?:of)?\s*)(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi, " ");

    // Remove "december 13" patterns
    s = s.replace(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{1,2}(st|nd|rd|th)?\b/gi, " ");

    // Remove relative dates
    s = s.replace(/\b(today|tomorrow|yesterday|day after tomorrow|day after)\b/g, " ");

    // Remove explicit time raw if present
    if (timeRaw) {
      const escaped = timeRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      s = s.replace(new RegExp(escaped, "gi"), " ");
    }

    // Remove time like "5:30", "5 pm", "5am"
    s = s.replace(/\b\d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)\b/g, " ");
    s = s.replace(/\b(in the )?(morning|evening|afternoon|night)\b/g, " ");

    // Remove common command words safely (we don't remove verbs like 'go' or nouns in title)
    s = s.replace(/\b(set|a|an|alarm|reminder|remind|remind me to|remind me|set an alarm|set a reminder|please|to)\b/g, " ");

    // Remove excess punctuation (keep letters and numbers)
    s = s.replace(/[^a-z0-9\s]/g, " ");

    // collapse spaces
    s = s.replace(/\s+/g, " ").trim();

    // If empty, try to take trailing segment after time/date tokens
    if (!s) {
      const afterTime = originalText.split(timeRaw || "").pop().trim();
      if (afterTime && afterTime.length > 0) {
        let candidate = afterTime.replace(/\b(at|on)\b/gi, "").trim();
        candidate = candidate.replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
        if (candidate) return candidate;
      }
    }

    if (!s) return "Reminder";
    return s;
  }

  // ---------------- main create function ----------------
  function createReminderFromSpeech(speech) {
    if (!speech) {
      alert("Didn't hear anything. Please try again.");
      return;
    }

    // Pre-normalize: merge split AM/PM early
    let raw = speech.replace(/\ba\s*m\b/gi, "am").replace(/\bp\s*m\b/gi, "pm");
    setTranscript(raw);

    const dateObj = parseDateFromText(raw);
    const timeObj = parseTimeFromText(raw);

    if (!timeObj) {
      alert("Couldn't detect a time. Please say something like 'at 5 PM' or '5 in the evening'.");
      return;
    }

    // base date: explicit date or today
    const baseDate = dateObj ? new Date(dateObj) : new Date();
    const finalDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

    finalDate.setHours(timeObj.hour, timeObj.minute || 0, 0, 0);

    // optional: if you want to auto-roll to next day when time already passed today, uncomment:
    // const now = new Date();
    // if (finalDate <= now) finalDate.setDate(finalDate.getDate() + 1);

    const title = extractTitleFromText(raw, dateObj, timeObj.raw);

    const dateStr =
      finalDate.getFullYear() +
      "-" +
      String(finalDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(finalDate.getDate()).padStart(2, "0");

    // format time as 12-hour with AM/PM
    const displayHour24 = finalDate.getHours();
    const displayMin = finalDate.getMinutes();
    const displayHour12 = displayHour24 % 12 || 12;
    const ampm = displayHour24 >= 12 ? "PM" : "AM";
    const timeStr = `${displayHour12}${displayMin ? ":" + String(displayMin).padStart(2, "0") : ""} ${ampm}`;

    const newReminder = {
      id: Date.now(),
      title,
      time: timeStr,
      date: dateStr,
      done: false,
    };

    const stored = JSON.parse(localStorage.getItem(REMINDERS_KEY)) || [];
    const updated = [...stored, newReminder];
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("remindersUpdated"));

    alert(`Reminder added: "${title}" at ${timeStr} on ${dateStr}`);
    navigate("/reminder");
  }

  // ---------------- mic control ----------------
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    // If starting
    if (!isListening) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          console.log("Speech recognition started");
        };

        recognition.onresult = (event) => {
          const speech = event.results[0][0].transcript;
          // small delay to ensure recognition finishes audio
          setTimeout(() => {
            createReminderFromSpeech(speech);
          }, 50);
        };

        recognition.onerror = (err) => {
          console.error("Speech recognition error", err);
          if (err && err.error === "not-allowed") {
            alert("Microphone permission denied. Please allow microphone access.");
          } else {
            alert("Speech recognition error. Check console for details.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
          console.log("Speech recognition ended");
        };

        recognition.start();
      } catch (e) {
        console.error("Could not start recognition", e);
        alert("Could not start speech recognition.");
      }
    } else {
      // stop
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      } catch (e) {}
      setIsListening(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7EC",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, Inter, sans-serif",
      }}
    >
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
            onClick={() => navigate("/voice-assistant")}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#E86E23",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>
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
            }}
          >
            🌐 EN
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          paddingTop: "140px",
          paddingBottom: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#2B2B2B",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          VOICE ASSISTANT
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#8B7B6F",
            marginBottom: "60px",
            fontWeight: 400,
          }}
        >
          Tap the microphone to speak
        </p>

        <button
          onClick={handleMicClick}
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: isListening ? "#D45E1A" : "#E86E23",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "64px",
            cursor: "pointer",
            boxShadow: isListening ? "0 0 30px rgba(232, 110, 35, 0.6)" : "0 8px 25px rgba(232, 110, 35, 0.3)",
            transition: "all 0.3s ease",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>
        </button>

        <p style={{ marginTop: "60px", fontSize: "18px", color: "#6B5E54", fontWeight: 500 }}>
          {isListening ? "Listening..." : "How are you feeling today?"}
        </p>

        {transcript && (
          <div
            style={{
              marginTop: "40px",
              padding: "20px 30px",
              background: "#F0EFE4",
              borderRadius: "12px",
              maxWidth: "600px",
              color: "#2B2B2B",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            <strong>You said:</strong> {transcript}
          </div>
        )}
      </div>
    </div>
  );
}

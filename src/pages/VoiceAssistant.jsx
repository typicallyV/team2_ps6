import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Fixed and improved VoiceAssistant component
// - More robust time-first parsing to avoid mistaking time numbers for day-of-month
// - Requires explicit "on" / month / ordinal for standalone day-of-month matches
// - Rolls reminder to next day when no explicit date and time already passed
// - Prevents multiple recognizers from starting
// - Safer cleanup and validation before saving
// - Inline non-blocking messages instead of alert()

const REMINDERS_KEY = "elderease_reminders";

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

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const resultTimeoutRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    return () => {
      // cleanup recognition and timeouts on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch (e) {
          // swallow
        }
        recognitionRef.current = null;
      }
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }
    };
  }, []);

  // ---------- helpers ----------
  function normalizeText(s) {
    if (!s) return "";
    return s.toLowerCase().replace(/\s+/g, " ").trim();
  }

  // parse time first to reduce ambiguity between '5' as hour vs day
  function parseTimeFromText(rawText) {
    if (!rawText) return null;
    let text = normalizeText(rawText);
    // Merge broken 'a m' / 'p m'
    text = text.replace(/\ba\s*m\b/g, "am").replace(/\bp\s*m\b/g, "pm");

    // 1) hh:mm with optional am/pm
    let m = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)?\b/);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ampm = m[3] ? m[3].replace(/\./g, "") : null;
      if (ampm) {
        if (/p/i.test(ampm) && h < 12) h += 12;
        if (/a/i.test(ampm) && h === 12) h = 0;
      }
      return { hour: h, minute: min, raw: m[0] };
    }

    // 2) number followed by am/pm (e.g., '5 pm', '5pm')
    m = text.match(/\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/);
    if (m) {
      let h = parseInt(m[1], 10);
      const ampm = m[2].replace(/\./g, "");
      if (/p/i.test(ampm) && h < 12) h += 12;
      if (/a/i.test(ampm) && h === 12) h = 0;
      return { hour: h, minute: 0, raw: m[0] };
    }

    // 3) words like 'five in the evening'
    const smallNums = {
      one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12
    };
    m = text.match(new RegExp("\\b(" + Object.keys(smallNums).join("|") + ")\\b(?:\\s*(in the)?\\s*(morning|evening|night|afternoon))?"));
    if (m) {
      let h = smallNums[m[1]];
      const part = m[3];
      if (part && (part === "evening" || part === "night" || part === "afternoon")) h = (h % 12) + 12;
      if (part === "morning" && h === 12) h = 0;
      return { hour: h, minute: 0, raw: m[0] };
    }

    // 4) fallback: if text contains only a single small number AND it's accompanied by words like 'at' or 'around'
    m = text.match(/(?:at|around|by)\s*(\d{1,2})\b/);
    if (m) {
      let h = parseInt(m[1], 10);
      return { hour: h, minute: 0, raw: m[0] };
    }

    return null;
  }

  // parse date but avoid interpreting bare numbers as dates unless explicitly marked
  function parseDateFromText(rawText) {
    if (!rawText) return null;
    let text = normalizeText(rawText);
    text = text.replace(/\ba\s*m\b/g, "am").replace(/\bp\s*m\b/g, "pm");
    const today = new Date();

    // 1) explicit numeric formats dd/mm/yyyy or dd-mm-yyyy
    let m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const year = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 2) '13th december 2025' or '13 december' or '13th of december' (explicit month present)
    m = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?(?:\s*(?:of)?\s*)(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:[,\s]*(\d{4}))?\b/i);
    if (m) {
      const day = parseInt(m[1], 10);
      const monthName = m[2];
      const month = MONTHS[monthName.toLowerCase()];
      const year = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 3) 'december 13 2025' or 'dec 13'
    m = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]*(\d{4}))?\b/i);
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

    // 5) 'on 13' or 'on 5th' -> only treat as date when 'on' is present or ordinal suffix is used
    m = text.match(/(?:\bon\s+)(\d{1,2})(?:st|nd|rd|th)?\b/);
    if (m) {
      const day = parseInt(m[1], 10);
      let candidate = new Date(today.getFullYear(), today.getMonth(), day);
      // if candidate already passed this month -> roll to next month
      const now = new Date();
      if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        let month = candidate.getMonth() + 1;
        let year = candidate.getFullYear();
        if (month > 11) {
          month = 0;
          year += 1;
        }
        candidate = new Date(year, month, day);
      }
      if (!isNaN(candidate.getTime())) return new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
    }

    return null;
  }

  // title extraction: remove only recognized date/time/command phrases, keep useful "to" phrases
  function extractTitleFromText(originalText, dateRaw, timeRaw) {
    if (!originalText) return "Reminder";
    let s = originalText;
    // remove common command prefixes like 'remind me to', 'set a reminder to', etc.
    s = s.replace(/\b(remind me to|remind me|set (an|a)? reminder to|set reminder to|set an alarm to)\b/gi, "");

    // remove explicit date/time tokens
    if (dateRaw) {
      try { s = s.replace(new RegExp(dateRaw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "gi"), " "); } catch (e) {}
    }
    if (timeRaw) {
      try { s = s.replace(new RegExp(timeRaw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "gi"), " "); } catch (e) {}
    }

    // remove leftover words that are explicitly just UI phrasing
    s = s.replace(/\b(on|at|for|please|alarm|reminder)\b/gi, " ");

    // strip punctuation and collapse spaces
    s = s.replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

    if (!s) return "Reminder";
    return s;
  }

  function formatDateISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatTime12(d) {
    const h24 = d.getHours();
    const m = d.getMinutes();
    const h12 = h24 % 12 || 12;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${ampm}`;
  }

  // create reminder entry with validation
  function createReminderFromSpeech(speech) {
    if (!speech) {
      setMessage({ type: 'error', text: "I didn't hear anything. Try again." });
      return;
    }

    const raw = speech.replace(/\ba\s*m\b/gi, "am").replace(/\bp\s*m\b/gi, "pm");
    setTranscript(raw);

    // --- NAVIGATION COMMAND HANDLER ---
    const navMatch = raw.match(/\b(?:go to|open|navigate to|take me to|show me)\s+(.+)/i);
    if (navMatch) {
      let target = navMatch[1].toLowerCase().trim();
      // remove filler words
      target = target.replace(/\b(the|page|screen|app)\b/gi, "").trim();

      const ROUTES = {
        prescriptions: "/prescriptions",
        prescription: "/prescriptions",
        reminders: "/reminder",
        reminder: "/reminder",
        dashboard: "/dashboard",
        home: "/",
        landing: "/",
        "voice assistant": "/voice-assistant",
        voice: "/voice-assistant",
        "health tracker": "/healthtracker",
        health: "/healthtracker",
        "mood tracker": "/moodtracker",
        mood: "/moodtracker",
        "health mood menu": "/healthmoodmenu",
        onboarding: "/onboarding",
        login: "/login",
        signup: "/signup",
        register: "/signup",
        prescriptions: "/prescriptions"
        // add more mappings as needed
      };

      // try direct map, else build a safe slug fallback
      let path = ROUTES[target];
      if (!path) {
        // try simple normalized key (remove spaces)
        const key = target.replace(/\s+/g, "");
        path = ROUTES[key] || `/${key}`;
      }

      try {
        navigate(path);
        setMessage({ type: "success", text: `Navigating to ${target}` });
      } catch (e) {
        setMessage({ type: "error", text: `Cannot navigate to "${target}"` });
      }
      return; // stop further reminder parsing
    }
    // --- end navigation handler ---

    const timeObj = parseTimeFromText(raw);
    const dateObj = parseDateFromText(raw);

    if (!timeObj) {
      setMessage({ type: 'error', text: "Couldn't detect a time. Say for example: 'at 5 PM' or '5 in the evening'." });
      return;
    }

    // base date: explicit date or today
    const baseDate = dateObj ? new Date(dateObj) : new Date();
    const finalDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    finalDate.setHours(timeObj.hour, timeObj.minute || 0, 0, 0);

    // if no explicit date specified and resulting time is already passed today, roll to next day
    if (!dateObj) {
      const now = new Date();
      if (finalDate <= now) {
        finalDate.setDate(finalDate.getDate() + 1);
      }
    }

    if (isNaN(finalDate.getTime())) {
      setMessage({ type: 'error', text: 'Parsed an invalid date/time. Please try phrasing it differently.' });
      return;
    }

    const dateStr = formatDateISO(finalDate);
    const timeStr = formatTime12(finalDate);

    const title = extractTitleFromText(raw, dateObj ? formatDateISO(dateObj) : null, timeObj.raw || null);

    const newReminder = {
      id: Date.now(),
      title,
      time: timeStr,
      date: dateStr,
      done: false,
    };

    try {
      const stored = JSON.parse(localStorage.getItem(REMINDERS_KEY)) || [];
      const updated = [...stored, newReminder];
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('remindersUpdated'));
      setMessage({ type: 'success', text: `Added: "${title}" at ${timeStr} on ${dateStr}` });

      // give user a moment to read message, then navigate
      setTimeout(() => navigate('/reminder'), 700);
    } catch (e) {
      console.error('Failed saving reminder', e);
      setMessage({ type: 'error', text: 'Failed to save reminder locally.' });
    }
  }

  // ---------------- mic control ----------------
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage({ type: 'error', text: 'Speech Recognition not supported in this browser.' });
      return;
    }

    // prevent double-start
    if (recognitionRef.current) {
      // already running -> stop it
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMessage(null);
      };

      recognition.onresult = (event) => {
        const speech = event.results[0][0].transcript;
        // small timeout to ensure recognition finalizes audio pipeline
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = setTimeout(() => {
          createReminderFromSpeech(speech);
        }, 120);
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error', err);
        setMessage({ type: 'error', text: 'Speech recognition error. Check microphone permissions.' });
      };

      recognition.onend = () => {
        setIsListening(false);
        // do not null-out recognitionRef here synchronously if onresult hasn't fired
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (e) {
      console.error('Could not start recognition', e);
      setMessage({ type: 'error', text: 'Could not start speech recognition.' });
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={{ minHeight: '100vh', background: '#F6F7EC', display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Navbar */}
      <div style={{ width: '100%', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'rgba(246, 247, 236, 0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '28px', color: '#E86E23', margin: 0, fontWeight: 700 }}>ElderEase</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div onClick={() => navigate('/voice-assistant')} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E86E23', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#D0C6B7', padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', color: '#3A3A3A' }}>🌐 EN</div>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: '140px', paddingBottom: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#2B2B2B', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>VOICE ASSISTANT</h1>
        <p style={{ fontSize: '20px', color: '#8B7B6F', marginBottom: '60px', fontWeight: 400 }}>Tap the microphone to speak</p>

        <button onClick={handleMicClick} style={{ width: '140px', height: '140px', borderRadius: '50%', background: isListening ? '#D45E1A' : '#E86E23', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '64px', cursor: 'pointer', boxShadow: isListening ? '0 0 30px rgba(232, 110, 35, 0.6)' : '0 8px 25px rgba(232, 110, 35, 0.3)', transition: 'all 0.3s ease' }}>
          <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>
        </button>

        <p style={{ marginTop: '60px', fontSize: '18px', color: '#6B5E54', fontWeight: 500 }}>{isListening ? 'Listening...' : 'How are you feeling today?'}</p>

        {transcript && (
          <div style={{ marginTop: '40px', padding: '20px 30px', background: '#F0EFE4', borderRadius: '12px', maxWidth: '600px', color: '#2B2B2B', fontSize: '16px', lineHeight: '1.6' }}>
            <strong>You said:</strong> {transcript}
          </div>
        )}

        {message && (
          <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '10px', background: message.type === 'error' ? '#FDECEA' : '#E8F8EE', color: message.type === 'error' ? '#6B1200' : '#064E3B' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

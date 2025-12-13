// frontend/src/config.js
export const API_BASE =process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const REMINDERS_API = `${API_BASE}/api/reminders`;
export const ONBOARDING_API = `${API_BASE}/api/onboarding/status`;

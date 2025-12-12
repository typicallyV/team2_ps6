// backend/controller/sosController.js
import User from "../models/User.js";
import axios from "axios";
import { sendSMS } from "../utils/sendSMS.js"; // optional util you may have

export const sendEmergencySOS = async (req, res) => {
  try {
    // 1) Auth check (session-based)
    if (!req.session?.isAuth || !req.session?.user?.id) {
      return res.status(401).json({ success: false, error: "Not authenticated. Please login first." });
    }
    const userId = req.session.user.id;

    // 2) Validate body
    const { locationLink } = req.body || {};
    if (!locationLink || typeof locationLink !== "string") {
      return res.status(400).json({ success: false, error: "locationLink is required in body" });
    }

    // 3) Load user and onboarding data
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (!user.onboardingCompleted || !user.onboardingData?.emergencyContact) {
      return res.status(400).json({ success: false, error: "No emergency contact found. Complete onboarding first." });
    }

    const emergencyContactRaw = String(user.onboardingData.emergencyContact || "").trim();
    if (!emergencyContactRaw) {
      return res.status(400).json({ success: false, error: "Emergency contact is empty" });
    }

    // 4) Normalize phone: remove non-digits, remove leading 0, ensure last 10 digits, prefix country code 91
    let digits = emergencyContactRaw.replace(/\D/g, "");
    // If user provided full international like '919876543210' keep that; else take last 10 digits
    if (digits.length > 10) {
      // try to detect if it already contains country code 91
      if (digits.length === 12 && digits.startsWith("91")) {
        // ok
      } else {
        // reduce to last 10 digits (common for messy inputs)
        digits = digits.slice(-10);
      }
    }
    // now ensure it's 10 digits
    if (digits.length !== 10) {
      return res.status(400).json({ success: false, error: "Emergency contact must contain a valid 10-digit phone number" });
    }

    const phoneNumberE164 = `91${digits}`; // MSG91 expects country code + number (no + sign)

    const userName = (user.onboardingData && user.onboardingData.name) || user.name || user.email || "User";

    // 5) Compose SMS message (short & clear)
    const timeStr = new Date().toLocaleString();
    const message = `EMERGENCY: ${userName} needs help NOW. Location: ${locationLink} Time: ${timeStr}`;

    console.log("\n[ SOS ] sending emergency:");
    console.log(" from:", userName, user.email || "");
    console.log(" to:", phoneNumberE164);
    console.log(" location:", locationLink);
    console.log(" message:", message);

    // 6) Send via your helper if available (recommended) — helper should use MSG91 properly
    if (typeof sendSMS === "function" && process.env.MSG91_AUTH_KEY) {
      try {
        // sendSMS should accept (mobile, variablesOrMessage) — adjust to your helper
        const ok = await sendSMS(digits /*without country*/, { message }); // or { otp: "..." } depending on implementation
        // if your sendSMS returns details, pass them back
        return res.json({ success: true, provider: "MSG91", sentTo: phoneNumberE164, info: ok });
      } catch (err) {
        console.error("[SOS] sendSMS helper failed:", err);
        // continue to fallback block to try direct axios call
      }
    }

    // 7) Fallback: call MSG91 Flow API (simple SMS array method you had)
    if (process.env.MSG91_AUTH_KEY) {
      try {
        const payload = {
          sender: process.env.MSG91_SENDER_ID || "MSGIND",
          route: process.env.MSG91_ROUTE || "4",
          country: "91",
          sms: [
            {
              message,
              to: [phoneNumberE164.replace(/^0+/, "")] // ensure no leading zeros
            }
          ]
        };

        const response = await axios.post("https://control.msg91.com/api/v5/flow/", payload, {
          headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            "Content-Type": "application/json"
          }
        });

        console.log("[SOS] MSG91 response:", response.data);
        return res.json({
          success: true,
          message: "SOS sent via MSG91",
          provider: "MSG91",
          to: phoneNumberE164,
          response: response.data
        });
      } catch (err) {
        console.error("[SOS] MSG91 direct error:", err.response?.data || err.message || err);
        return res.status(500).json({
          success: false,
          error: "Failed to send SMS via MSG91",
          details: err.response?.data || err.message
        });
      }
    }

    // 8) Mock/Debug mode (no MSG91 configured)
    console.log("[SOS] Mock mode - MSG91 not configured. SMS would be:");
    console.log(message);
    return res.json({
      success: true,
      message: "SOS logged (mock mode - SMS not sent).",
      provider: "Mock",
      to: phoneNumberE164,
      messagePreview: message
    });
  } catch (err) {
    console.error("[SOS] unexpected error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

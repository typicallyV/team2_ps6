const express = require("express");
const router = express.Router();
const twilio = require("twilio");

// Load Twilio credentials from .env
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /send-sos
router.post("/send-sos", async (req, res) => {
  const { emergencyNumber, locationLink } = req.body;

  if (!emergencyNumber) {
    return res.status(400).json({ success: false, message: "No emergency number" });
  }

  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886",  // Twilio WhatsApp Sandbox Number
      to: `whatsapp:${emergencyNumber}`,  
      body: `
🚨 EMERGENCY ALERT 🚨
The user needs immediate assistance.

📍 Location: ${locationLink}
⏰ Time: ${new Date().toLocaleString()}
      `
    });

    return res.json({ success: true, sid: message.sid });

  } catch (err) {
    console.error("WhatsApp SOS Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

import Mood from "../models/Mood.js";

export const addMood = async (req, res) => {
  try {
    // Accept either userId or nested user.id
    const userId = req.session?.userId || req.session?.user?.id;
    console.log("DEBUG: session on /api/moods:", req.session);
    console.log("DEBUG: incoming cookies:", req.headers.cookie);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // read data from request body (prevent ReferenceError)
    const {
      moodLabel,
      moodEmoji = "",
      dateISO,
      time = "",
      timestamp = new Date().toISOString(),
      tags = [],
      notes = "",
    } = req.body || {};

    // basic validation
    if (!moodLabel || !dateISO) {
      return res.status(400).json({ ok: false, error: "moodLabel and dateISO are required" });
    }

    // create mood document
    const mood = await Mood.create({
      user: userId,
      moodLabel,
      moodEmoji,
      dateISO,
      time,
      timestamp,
      tags,
      notes,
    });

    return res.status(201).json({ ok: true, mood });
  } catch (err) {
    console.error("addMood error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

export const getMoods = async (req, res) => {
  try {
    const userId = req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { since, until } = req.query;
    const q = { user: userId };
    if (since || until) {
      q.dateISO = {};
      if (since) q.dateISO.$gte = since;
      if (until) q.dateISO.$lte = until;
    }

    const moods = await Mood.find(q).sort({ timestamp: -1 }).limit(1000);
    return res.json({ ok: true, moods });
  } catch (err) {
    console.error("getMoods error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

export const deleteMood = async (req, res) => {
  try {
    const userId = req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const mood = await Mood.findOne({ _id: id, user: userId });
    if (!mood) return res.status(404).json({ error: "Not found" });

    await mood.remove();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteMood error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
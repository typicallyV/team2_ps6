import mongoose from "mongoose";

const MoodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  moodLabel: { type: String, required: true },
  moodEmoji: { type: String, required: false },
  dateISO: { type: String, required: true }, // YYYY-MM-DD for easy grouping
  time: { type: String },
  timestamp: { type: Date, default: Date.now },
  tags: [{ type: String }],
  notes: { type: String, default: "" },
});

export default mongoose.model("Mood", MoodSchema);

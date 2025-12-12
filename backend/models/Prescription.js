// backend/models/Prescription.js
import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String },   // optional path or URL stored by server
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Prescription", PrescriptionSchema);

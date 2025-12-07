const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  name: String,
  url: String,   // file path stored in uploads folder
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);

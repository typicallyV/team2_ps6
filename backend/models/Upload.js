const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema({
  fileName: String,
  fileType: String,
  fileData: String,  // Base64 string
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Upload", UploadSchema);

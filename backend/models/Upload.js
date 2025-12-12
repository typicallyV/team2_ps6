// backend/models/Upload.js
import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileData: { type: String, required: true },  // Base64 string
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Upload", UploadSchema);

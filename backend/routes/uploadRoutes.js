const express = require("express");
const multer = require("multer");
const Upload = require("../models/Upload");

const router = express.Router();

// Multer memory storage for saving file as Base64
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------------
// POST /upload
// ------------------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = new Upload({
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileData: req.file.buffer.toString("base64"),
      uploadedAt: new Date(),
    });

    await file.save();
    console.log(`✅ File uploaded: ${file.fileName} (ID: ${file._id})`);

    res.json({
      _id: file._id,
      name: file.fileName,
      date: file.uploadedAt,
      url: `/prescriptions/${file._id}`,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------
// GET /prescriptions
// ------------------------
router.get("/prescriptions", async (req, res) => {
  try {
    const files = await Upload.find().sort({ uploadedAt: -1 });
    console.log(`📋 Fetched ${files.length} prescriptions`);

    const formatted = files.map(f => ({
      _id: f._id,
      name: f.fileName,
      date: f.uploadedAt,
      url: `/prescriptions/${f._id}`,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------
// GET /prescriptions/:id
// ------------------------
router.get("/prescriptions/:id", async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    console.log(`📥 Retrieving file: ${file.fileName}`);
    res.set("Content-Type", file.fileType);
    res.send(Buffer.from(file.fileData, "base64"));
  } catch (error) {
    console.error("❌ Retrieve error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------
// DELETE /prescriptions/:id
// ------------------------
router.delete("/prescriptions/:id", async (req, res) => {
  try {
    const file = await Upload.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    console.log(`🗑️  Deleted file: ${file.fileName}`);
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

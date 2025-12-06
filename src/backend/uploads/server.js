const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Prescription = require("./models/Prescription");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const newFile = await Prescription.create({
      name: req.file.originalname,
      url: req.file.path,
    });
    res.json(newFile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all prescriptions
app.get("/prescriptions", async (req, res) => {
  try {
    const files = await Prescription.find().sort({ date: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));

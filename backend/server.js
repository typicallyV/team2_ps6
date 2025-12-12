require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Use MONGO_URI from .env if present (fall back to local)
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elderEase";

// ---- FIXED MONGOOSE CONNECTION ----
mongoose
  .connect(mongoUri)
  .then(() =>
    console.log(
      "✅ MongoDB Connected ->",
      mongoUri.startsWith("mongodb+srv") ? "Atlas" : "Local"
    )
  )
  .catch((err) => console.log("❌ Mongo connection error:", err));

// ---- MOUNT ROUTES ----
app.use("/", require("./routes/uploadRoutes"));

// SOS Route
app.use("/", require("./routes/sosRoutes"));

// ---- LISTEN ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import mongoose from "mongoose";
import authRoutes from "./routes/authroutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js"; // NEW
import sosRoutes from "./routes/sosRoutes.js"; // NEW
import connectDB from "./utils/connectDB.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MongoDBSession = connectMongoDBSession(session);

// trust proxy when behind a reverse proxy (set in production)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-side
      if (!origin) return callback(null, true);

      // Local development
      if (origin.startsWith("http://localhost")) {
        return callback(null, origin);
      }

      // Allow all Vercel deployments (preview + prod)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, origin);
      }

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Connect to MongoDB -----
try {
  await connectDB();
} catch (err) {
  console.error("Failed to start server due to DB error");
  process.exit(1);
}

// ----- Session store -----
const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// optional: handle store errors
store.on("error", function (error) {
  console.error("Session store error:", error);
});

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "change_me_now",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    },
  })
);

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/onboarding", onboardingRoutes); // NEW - Onboarding routes
app.use("/api/sos", sosRoutes); // NEW - SOS routes
app.use("/api/reminders", reminderRoutes);
// Test route for moods
app.post("/api/test-moods", (req, res) => {
  console.log("POST /api/test-moods body:", req.body);
  res.json({ ok: true, received: req.body });
});

// Health & session-check
app.get("/", (req, res) => res.json({ ok: true, message: "ElderEase API Running" }));

app.get("/api/session-check", (req, res) => {
  res.json({ 
    authenticated: !!req.session?.isAuth, 
    user: req.session?.user || null 
  });
});

// Health check with SMS status
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "ElderEase Backend Running",
    smsConfigured: !!process.env.MSG91_AUTH_KEY,
    smsProvider: process.env.MSG91_AUTH_KEY ? "MSG91" : "Mock",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 SMS Provider: ${process.env.MSG91_AUTH_KEY ? "MSG91 ✅" : "Mock Mode ⚠️"}`);
  console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌"}`);
   
  console.log(`   1. Sign up at https://msg91.com/signup`);
  console.log(`   2. Get Auth Key from Settings → API Keys`);
  console.log(`   3. Add to .env: MSG91_AUTH_KEY=your_key_here\n`);
});

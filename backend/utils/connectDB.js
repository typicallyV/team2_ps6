// config/connectDB.js
import mongoose from "mongoose";

const connectDB = async () => {
  // If already connected, don't reconnect again
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected ✔");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected ✔");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err; // let server.js decide how to handle it
  }
};

export default connectDB;

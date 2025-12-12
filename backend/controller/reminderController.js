// controllers/reminderController.js
import Reminder from "../models/Reminder.js";
import mongoose from "mongoose";

// Get all reminders for logged-in user
export const getReminders = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    console.log("🔍 Getting reminders for userId:", userId);
    console.log("🔍 Session data:", req.session);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    const reminders = await Reminder.find({ userId }).sort({
      date: 1,
      time: 1,
    });
    
    console.log(`✅ Found ${reminders.length} reminders`);
    res.json({ success: true, reminders });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reminders" });
  }
};

// Create new reminder
export const createReminder = async (req, res) => {
  try {
    const { title, time, date } = req.body;
    const userId = req.session.userId;

    console.log("📝 Creating reminder:");
    console.log("  - userId:", userId);
    console.log("  - title:", title);
    console.log("  - time:", time);
    console.log("  - date:", date);
    console.log("  - isAuth:", req.session.isAuth);

    if (!userId) {
      console.log("❌ No userId in session");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!title || !time || !date) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Title, time, and date are required",
      });
    }

    const reminder = new Reminder({
      userId,
      title,
      time,
      date,
      done: false,
    });

    await reminder.save();
    console.log("✅ Reminder created successfully:", reminder._id);
    
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create reminder",
      error: error.message 
    });
  }
};

// Update reminder (toggle done or edit)
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.session.userId;

    console.log("🔄 Updating reminder:", id);
    console.log("  - userId:", userId);
    console.log("  - updates:", updates);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      console.log("❌ Reminder not found or doesn't belong to user");
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    Object.keys(updates).forEach((key) => {
      reminder[key] = updates[key];
    });

    await reminder.save();
    console.log("✅ Reminder updated successfully");
    res.json({ success: true, reminder });
  } catch (error) {
    console.error("❌ Error updating reminder:", error);
    res.status(500).json({ success: false, message: "Failed to update reminder" });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    console.log("🗑️ Deleting reminder:", id);
    console.log("  - userId:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const reminder = await Reminder.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!reminder) {
      console.log("❌ Reminder not found or doesn't belong to user");
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    console.log("✅ Reminder deleted successfully");
    res.json({ success: true, message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    res.status(500).json({ success: false, message: "Failed to delete reminder" });
  }
};
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import SetupSteps from "./pages/SetupSteps.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Prescription from "./pages/Prescription.jsx";
import VoiceAssistant from "./pages/VoiceAssistant.jsx";
import Reminder from "./pages/Reminder.jsx";
import HealthMoodMenu from "./pages/HealthMoodMenu.jsx";
import MoodTrackerPage from "./pages/MoodTrackerPage.jsx";
import HealthTracker from "./pages/HealthTracker.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<SetupSteps />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/prescriptions" element={<Prescription />} />
        <Route path="/voice-assistant" element={<VoiceAssistant />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/healthmoodmenu" element={<HealthMoodMenu />} />
        <Route path="/moodtracker" element={<MoodTrackerPage />} />
         <Route path="healthtracker" element={<HealthTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

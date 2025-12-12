import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // Onboarding completion status
  onboardingCompleted: { 
    type: Boolean, 
    default: false 
  },
  
  // Onboarding data
  onboardingData: {
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    medicalCondition: { type: String, default: "" },
    medicines: { type: String, default: "" }
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("User", UserSchema);
import User from "../models/User.js";

// @desc    Save onboarding data for authenticated user
// @route   POST /api/onboarding/complete
// @access  Private (requires auth)
export const completeOnboarding = async (req, res) => {
  try {
    // Check if user is authenticated via session
    if (!req.session?.isAuth || !req.session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    const userId = req.session.user.id;

    // Extract onboarding data from request body
    const {
      name,
      age,
      address,
      phone,
      emergencyContact,
      medicalCondition,
      medicines
    } = req.body;

    // Validate required fields
    if (!name || !age || !emergencyContact) {
      return res.status(400).json({
        success: false,
        message: "Name, age, and emergency contact are required"
      });
    }

    // Find user and update with onboarding data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingCompleted: true,
        onboardingData: {
          name: name.trim(),
          age: age.trim(),
          address: address.trim(),
          phone: phone.trim(),
          emergencyContact: emergencyContact.trim(),
          medicalCondition: medicalCondition.trim(),
          medicines: medicines.trim()
        },
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update session with new user data
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.onboardingData.name,
      onboardingCompleted: user.onboardingCompleted
    };

    console.log("✅ Onboarding completed for:", user.email);
    console.log("📋 Data saved:", user.onboardingData);

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.onboardingData.name,
        onboardingCompleted: user.onboardingCompleted,
        onboardingData: user.onboardingData
      }
    });

  } catch (error) {
    console.error("❌ Onboarding error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving onboarding data",
      error: error.message
    });
  }
};

// @desc    Get onboarding status and data
// @route   GET /api/onboarding/status
// @access  Private (requires auth)
export const getOnboardingStatus = async (req, res) => {
  try {
    if (!req.session?.isAuth || !req.session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const userId = req.session.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      onboardingData: user.onboardingData || null
    });

  } catch (error) {
    console.error("❌ Get onboarding status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Update onboarding data (if user wants to edit)
// @route   PUT /api/onboarding/update
// @access  Private (requires auth)
export const updateOnboarding = async (req, res) => {
  try {
    if (!req.session?.isAuth || !req.session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const userId = req.session.user.id;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "onboardingData.name": updateData.name?.trim(),
          "onboardingData.age": updateData.age?.trim(),
          "onboardingData.address": updateData.address?.trim(),
          "onboardingData.phone": updateData.phone?.trim(),
          "onboardingData.emergencyContact": updateData.emergencyContact?.trim(),
          "onboardingData.medicalCondition": updateData.medicalCondition?.trim(),
          "onboardingData.medicines": updateData.medicines?.trim(),
          updatedAt: Date.now()
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ Onboarding updated for:", user.email);

    res.status(200).json({
      success: true,
      message: "Onboarding data updated successfully",
      onboardingData: user.onboardingData
    });

  } catch (error) {
    console.error("❌ Update onboarding error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
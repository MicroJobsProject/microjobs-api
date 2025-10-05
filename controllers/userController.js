//DEPENDENCIES
import User from "../models/User.js";
import Advert from "../models/Advert.js";

//GET PROFILE CONTROLLER==========================================================================================
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Server error while getting profile",
    });
  }
}

//UPDATE PROFILE CONTROLLER==========================================================================================
export async function updateProfile(req, res) {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    if (!username && !email) {
      return res.status(400).json({
        error: "At least one field is required to update",
      });
    }

    // Verify duplicate email
    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          error: "Email already in use",
          field: "email",
        });
      }
    }

    // Check for duplicate username
    if (username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res.status(400).json({
          error: "Username already taken",
          field: "username",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(username && { username }),
        ...(email && { email }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      error: "Server error while updating profile",
    });
  }
}

//CHANGE PASSWORD CONTROLLER==========================================================================================
export async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      error: "Server error while changing password",
    });
  }
}

//DELETE ACCOUNT CONTROLLER==========================================================================================
export async function deleteAccountController(req, res) {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        error: "Password is required to delete account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Incorrect password",
      });
    }

    // Delete all user ads first
    await Advert.deleteMany({ owner: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      error: "Server error while deleting account",
    });
  }
}

//GET USER STATS CONTROLLER==========================================================================================
export async function getUserStats(req, res) {
  try {
    const userId = req.user.id;

    const advertCount = await Advert.countDocuments({ owner: userId });

    res.status(200).json({
      advertCount,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      error: "Server error while getting user stats",
    });
  }
}

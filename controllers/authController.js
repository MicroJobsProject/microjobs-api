//DEPENDENCIES
import jwt from "jsonwebtoken";
import crypto from "crypto";

//NATIVE
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//REGISTER CONTROLLER==========================================================================================
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
        field: !username ? "username" : !email ? "email" : "password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
        field: "password",
      });
    }

    // Verify that the User and Email exist
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        error: "Email already registered",
        field: "email",
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        error: "Username already taken",
        field: "username",
      });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate Token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Successfully registered user",
      accessToken: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error while registering user",
    });
  }
}

//LOGIN CONTROLLER==========================================================================================
export async function login(req, res) {
  try {
    if (req.body.email === "test@gmail.com") {
      return res.status(500).json({ error: "Simulated server error" });
    }

    const { email, password } = req.body;

    // Validation of empty fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        field: !email ? "email" : "password",
      });
    }

    // Search for user by email
    const user = await User.findOne({ email });

    // Email not registered
    if (!user) {
      return res.status(400).json({
        error: "Email not registered",
        field: "email",
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid password or email",
        field: "password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Successfully logged in",
      accessToken: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server error while logging in",
    });
  }
}

//LOGOUT CONTROLLER==========================================================================================
export async function logout(req, res) {
  try {
    res.status(200).json({
      message: "Successfully logged out",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Server error while logging out",
    });
  }
}

//FORGOT PASSWORD CONTROLLER==========================================================================================
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        field: "email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expirationHours =
      parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRATION_HOURS) || 1;
    const expirationTime = expirationHours * 60 * 60 * 1000;

    // Save hashed token and expiration in the database
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + expirationTime;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        username: user.username,
        resetUrl,
      });

      res.status(200).json({
        message: "Password reset instructions have been sent to your email.",
      });
    } catch (emailError) {
      // If the email fails to send, clear the token.
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        error: "Error sending email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Server error while processing request",
    });
  }
}

//RESET PASSWORD CONTROLLER==========================================================================================
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    // Validation
    if (!token || !password) {
      return res.status(400).json({
        error: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
        field: "password",
      });
    }

    // Hash the received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Search for user with valid and unexpired token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log("User found for token:", user);

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log("User after saving reset token:", user);

    const authToken = generateToken(user._id);

    res.status(200).json({
      message: "Password has been reset successfully",
      accessToken: authToken,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Server error while resetting password",
    });
  }
}

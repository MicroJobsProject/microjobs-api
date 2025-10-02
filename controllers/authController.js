//DEPENDENCIES
import jwt from "jsonwebtoken";

//NATIVE
import User from "../models/User.js";

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

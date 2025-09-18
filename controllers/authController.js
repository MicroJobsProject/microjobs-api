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

    //Validación
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

    // Verificar que si el Usuario y Email existen
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

    // Crear usuario
    const user = new User({ username, email, password });
    await user.save();

    // Generar Token
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
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        field: !email ? "email" : "password",
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
        field: "email",
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: "Invalid email or password",
        field: "password",
      });
    }

    // Generar token
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

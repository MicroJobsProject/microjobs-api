//DEPENDENCIES
import express from "express";
import cors from "cors";

//NATIVE
import connectMongoose from "./lib/connectMongoose.js";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "./controllers/authController.js";
import {
  getProfile,
  updateProfile,
  changePasswordController,
  deleteAccountController,
  getUserStats,
} from "./controllers/userController.js";
import {
  getAdverts,
  createAdvert,
  getAdvertCategories,
  updateAdvert,
  deleteAdvert,
} from "./controllers/advertsController.js";
import { authenticateToken } from "./middleware/auth.js";
import upload from "./middleware/upload.js";
/**
 * MONGODB CONNECTION
 */
await connectMongoose();
console.log("Connected to MongoDB");

/**
 * APP INIT
 */
const app = express();

/**
 * MIDDLEWARE
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
/**
 * ROUTES
 */
// Auth routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.post("/api/auth/forgot-password", forgotPassword);
app.post("/api/auth/reset-password", resetPassword);

// User profile routes (protected)
app.get("/api/user/profile", authenticateToken, getProfile);
app.put("/api/user/profile", authenticateToken, updateProfile);
app.put("/api/user/password", authenticateToken, changePasswordController);
app.delete("/api/user/account", authenticateToken, deleteAccountController);
app.get("/api/user/stats", authenticateToken, getUserStats);

// Adverts routes
app.get("/api/adverts", getAdverts);
app.post(
  "/api/adverts",
  authenticateToken,
  upload.single("photo"),
  createAdvert
);

//Temporary code to fix errors=================================================
app.put("/api/adverts/:id", authenticateToken, updateAdvert);
app.delete("/api/adverts/:id", authenticateToken, deleteAdvert);
//=============================================================================

app.delete("/api/adverts", authenticateToken, deleteAdvert);
app.get("/api/adverts/categories", getAdvertCategories);

/**
 * EXPORT
 */
export default app;

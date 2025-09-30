//DEPENDENCIES
import path from "node:path";
import express from "express";
import cors from "cors";

//NATIVE
import connectMongoose from "./lib/connectMongoose.js";
import { register, login, logout } from "./controllers/authController.js";
import {
  getAdverts,
  createAdvert,
  getAdvertCategories,
  updateAdvert,
  deleteAdvert,
} from "./controllers/advertsController.js";
import { authenticateToken } from "./middleware/auth.js";
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

/**
 * ROUTES
 */
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/adverts", getAdverts);
app.post("/api/adverts", authenticateToken, createAdvert);
app.put("/api/adverts", authenticateToken, updateAdvert);
app.delete("/api/adverts", authenticateToken, deleteAdvert);
app.get("/api/adverts/categories", getAdvertCategories);

/**
 * EXPORT
 */
export default app;

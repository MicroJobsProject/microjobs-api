import path from "node:path";
import express from "express";
import cors from "cors";
import connectMongoose from "./lib/connectMongoose.js";
import { register } from "./controllers/authController.js";

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
app.use(cors());
app.use(express.json());

/**
 * ROUTES
 */
app.post("/api/auth/register", register);

/**
 * EXPORT
 */
export default app;

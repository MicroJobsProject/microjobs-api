//DEPENDENCIES
import mongoose from "mongoose";

export default async function connectMongoose() {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
    };

    const connection = await mongoose.connect(process.env.MONGODB_URI, options);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });

    return connection.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

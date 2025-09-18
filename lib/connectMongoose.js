//DEPENDENCIES
import mongoose from "mongoose";

export default function connectMongoose() {
  return mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose.connection);
}

//DEPENDENCIES
import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
});

const Category = model("Category", categorySchema);

export default Category;

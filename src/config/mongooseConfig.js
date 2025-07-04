import mongoose from "mongoose";
import dotenv from "dotenv";
import { categorySchema } from "../features/product/category.schema.js";

dotenv.config();

const url = process.env.MONGO_URI;

export const connectUsingMongoose = async () => {
  if (!url) {
    console.error("❌ MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(url); // ✅ No need for deprecated options
    console.log("✅ MongoDB connected using Mongoose");

    await addCategories(); // ✅ await to ensure categories are added before continuing
  } catch (err) {
    console.error("❌ Error while connecting to DB:");
    console.error(err);
  }
};

async function addCategories() {
  const CategoryModel = mongoose.model("Category", categorySchema);

  const categories = await CategoryModel.find(); // ✅ await this

  if (!categories || categories.length === 0) {
    await CategoryModel.insertMany([
      { name: "Books" },
      { name: "Clothing" },
      { name: "Electronics" },
    ]);
    console.log("✅ Categories inserted");
  } else {
    console.log("✅ Categories already exist");
  }
}

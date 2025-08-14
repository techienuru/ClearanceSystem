import mongoose from "mongoose";
import { DATABASE_URI } from "./secretKeys.js";

const connectDB = async function () {
  try {
    await mongoose.connect(DATABASE_URI);
  } catch (err) {
    console.error("Error connecting to DB: ", err);
  }
};

export default connectDB;

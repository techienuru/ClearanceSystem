import mongoose from "mongoose";
const { Schema } = mongoose;

const requirementSchema = {
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: String,
  description: String,
  roleID: {
    type: String,
    required: true,
  },
};

export default mongoose.model("Requirement", requirementSchema, "requirement");

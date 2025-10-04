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
  amount: Number,
  description: String,
  role_id: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
};

export default mongoose.model("Requirement", requirementSchema, "requirement");

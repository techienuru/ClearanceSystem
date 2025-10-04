import mongoose from "mongoose";
const { Schema } = mongoose;

const clearanceSchema = new Schema(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    requirement_id: {
      type: Schema.Types.ObjectId,
      ref: "Requirement",
      required: true,
    },
    submissions: [
      {
        filename: String,
        original_name: String,
        mimetype: String,
        size: Number,
      },
    ],
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Paid"] },
    feedback: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Clearance", clearanceSchema, "clearance");

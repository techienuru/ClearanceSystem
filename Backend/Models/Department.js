import mongoose from "mongoose";
const { Schema } = mongoose;

const departmentSchema = new Schema({
  faculty_id: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  department_name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("Department", departmentSchema, "department");

import mongoose from "mongoose";
const { Schema } = mongoose;

const departmentSchema = new Schema({
  facultyID: {
    type: String,
    required: true,
  },
  departmentName: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Department", departmentSchema, "department");

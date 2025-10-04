import mongoose from "mongoose";
const { Schema } = mongoose;

const facultySchema = new Schema({
  faculty_name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("Faculty", facultySchema, "faculty");

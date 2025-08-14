import mongoose from "mongoose";
const { Schema } = mongoose;

const facultySchema = new Schema({
  facultyName: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Faculty", facultySchema, "faculty");

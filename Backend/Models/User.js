import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  roleID: {
    type: String,
    required: true,
  },
  fullname: String,
  matric: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  facultyID: String,
  departmentID: String,
  refreshToken: String,
});

export default mongoose.model("User", UserSchema, "user");

import mongoose from "mongoose";
const { Schema } = mongoose;

const roleSchema = new Schema({
  role_name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Role", roleSchema, "role");

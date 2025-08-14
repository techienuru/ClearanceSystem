import mongoose from "mongoose";
const { Schema } = mongoose;

const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Role", roleSchema, "role");

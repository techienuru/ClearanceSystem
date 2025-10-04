import mongoose, { Mongoose } from "mongoose";

const { Schema } = mongoose;

const clearanceStatusSchema = new Schema(
  {
    _id: false,
    role_id: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    total_requirement: { type: Number, default: 0 },
    submitted: { type: Number, default: 0 },
    cleared: { type: Boolean, default: false },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Creating and calculating a virtual clearance_status's score field
clearanceStatusSchema.virtual("score").get(function () {
  return this.submitted && this.total_requirement
    ? (this.submitted / this.total_requirement) * 100
    : 0;
});

// For all users
const baseUserSchema = new Schema(
  {
    role_id: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    fullname: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    matric_no: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: true,
    },
    faculty_id: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    refreshToken: String,
  },
  { timestamps: true, discriminatorKey: "user_type" }
);

// Student-specific schema
const studentSchema = new Schema({
  wallet: {
    balance: { type: Number, default: 0 },
  },
  clearance_status: [clearanceStatusSchema],
});

// Admin-specific schema
const adminSchema = new Schema({});

// Officer-specific schema
const officerSchema = new Schema({});

// Create base model
const User = mongoose.model("User", baseUserSchema, "user");

const Admin = User.discriminator("Admin", adminSchema);
const Officer = User.discriminator("Officer", officerSchema);
const Student = User.discriminator("Student", studentSchema);

export { User, Admin, Officer, Student };

// pre-hook for calculating clearance score
// userSchema.pre("save", function (next) {
//   this.clearance_status.forEach((status) => {
//     status.score = status.total_requirement
//       ? (status.submitted / status.total_requirement) * 100
//      R: 0;
//   });
//   next();
// });

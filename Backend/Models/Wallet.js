import mongoose from "mongoose";
const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema, "wallet");

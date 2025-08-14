import mongoose from "mongoose";
import User from "../../Models/User.js";
import Wallet from "../../Models/Wallet.js";

export const getWalletDetails = async (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ error: "Invalid userId!" });

  try {
    const foundWallet = await Wallet.findOne({ userId })
      .populate("userId", "fullname email userId")
      .select("-__v")
      .lean();

    res.json({ message: "success", userWallet: foundWallet });
  } catch (err) {
    next(err);
  }
};

export const creditWallet = async (req, res, next) => {
  if (!req?.body?.amount)
    return res.status(400).json({ error: "Missing required field 'amount'" });

  const { amount } = req.body;
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId))
    return res.status(404).json({ error: "Invalid userId" });

  if (typeof amount !== "number" || amount <= 0)
    return res.status(404).json({ error: "Amount must be a positive number" });

  try {
    const foundUser = await User.findById(userId).exec();
    if (!foundUser)
      return res.status(401).json({ error: "User does not exist!" });

    const created = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );

    res.json({ message: "success", created });
  } catch (err) {
    next(err);
  }
};

export const debitWallet = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (amount == null)
      return res
        .status(400)
        .json({ error: "Missing required field 'amount'." });

    if (!mongoose.isValidObjectId(userId))
      return res.status(400).json({ error: "Invalid userId." });

    if (typeof amount !== "number" || amount <= 0)
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });

    const foundUser = await User.findById(userId).exec();
    if (!foundUser) return res.status(404).json({ error: "User not found" });

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );

    if (!updatedWallet) {
      const walletExist = await Wallet.exists({ userId }).exec();
      if (!walletExist)
        return res.status(404).json({ error: "Wallet not found" });

      return res.status(409).json({ error: "Insufficient funds" });
    }

    res.json({ message: "success", userWallet: updatedWallet });
  } catch (err) {
    next(err);
  }
};

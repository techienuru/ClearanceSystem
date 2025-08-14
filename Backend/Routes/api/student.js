import express from "express";
import {
  creditWallet,
  debitWallet,
  getWalletDetails,
} from "../../Controllers/api/studentControllers.js";

const studentRoute = express.Router();

// All routes are preceeded with "/api/students"
studentRoute.get("/:userId/wallet", getWalletDetails);

studentRoute.post("/:userId/wallet/credit", creditWallet);

studentRoute.post("/:userId/wallet/debit", debitWallet);

export default studentRoute;

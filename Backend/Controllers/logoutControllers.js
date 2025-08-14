import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const handleLogout = async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(401).json({ error: "Please login first." });
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "Lax" }); // In production or when deploying, set "secure:true" && sameSite:"None"
    return res.status(403).json({ error: "Invalid token" });
  }

  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true }); // In production or when deploying, set "secure:true" && sameSite:"None"
  res.status(204).json({ message: "Logout success" });
};

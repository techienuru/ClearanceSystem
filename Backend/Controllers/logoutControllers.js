import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

export const handleLogout = async (req, res, next) => {
  const cookies = req.cookies;

  // No cookie present
  if (!cookies?.jwt)
    return res.status(401).json({ error: "Please login first." });
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();

  let sameSiteval, secureVal;

  if (process.env.NODE_ENV === "production") {
    sameSiteval = "None";
    secureVal = true;
  } else {
    sameSiteval = "Lax";
    secureVal = false;
  }

  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: secureVal,
      sameSite: sameSiteval,
    }); // In production or when deploying, set "secure:true" && sameSite:"None"
    return res.status(403).json({ error: "Invalid token" });
  }

  foundUser.refreshToken = "";
  const result = await foundUser.save();

  if (result) {
    res.clearCookie("jwt", { httpOnly: true });
    res.status(204).json({ message: "Logout success" });
  }
};

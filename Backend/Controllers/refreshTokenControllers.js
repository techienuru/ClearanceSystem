import jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/secretKeys.js";
import User from "../Models/User.js";

const refreshJWT = async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(401).json({ error: "Please login first." });
  const refreshToken = cookies.jwt;

  try {
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) return res.status(403).json({ error: "Invalid token" });

    jwt.verify(foundUser.refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || foundUser._id.toString() !== decoded.id)
        return res.status(403).json({ error: "Invalid or expired token." });
    });

    const accessToken = jwt.sign(
      { id: foundUser._id.toString(), roleID: foundUser.roleID },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ message: "Refresh success", accessToken });
  } catch (err) {
    next(err);
  }
};

export default refreshJWT;

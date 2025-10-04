import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/secretKeys.js";
import { User } from "../Models/User.js";

export const handleLogin = async (req, res, next) => {
  if ((!req?.body?.email && !req?.body?.matric) || !req?.body?.password)
    return res
      .status(400)
      .json({ error: "'email/matric','password' are required fields." });

  const { email, matric, password } = req.body;

  try {
    let foundUser;

    if (matric) {
      foundUser = await User.findOne({ matric_no: matric })
        .populate("role_id", "-_id -__v")
        .exec();
    } else if (email) {
      foundUser = await User.findOne({ email })
        .populate("role_id", "-__v")
        .exec();
    }

    if (!foundUser)
      return res.status(401).json({ error: "Invalid credentials!" });

    const pwdCorrect = await bcrypt.compare(password, foundUser.password);

    if (!pwdCorrect)
      return res.status(401).json({ error: "Invalid credentials!" });

    const payload = {
      id: foundUser._id.toString(),
      role: foundUser.user_type,
      role_id: foundUser.role_id._id,
      role_name: foundUser.role_id.role_name,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: "2d",
    });

    foundUser.refreshToken = refreshToken;
    await foundUser.save();
    let sameSiteVal, secureVal;

    // In production (when deployed), set "secure:true" && sameSite:"None"
    // In dev, "secure:false" && sameSite:"Lax"
    if (process.env.NODE_ENV === "production") {
      sameSiteVal = "None";
      secureVal = true;
    } else {
      sameSiteVal = "Lax";
      secureVal = false;
    }

    res.cookie("jwt", refreshToken, {
      secure: secureVal,
      sameSite: sameSiteVal,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.json({
      message: "Login success",
      accessToken,
      role: foundUser.user_type,
    });
  } catch (err) {
    next(err);
  }
};

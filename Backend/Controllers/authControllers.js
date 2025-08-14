import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/secretKeys.js";
import User from "../Models/User.js";

export const handleLogin = async (req, res, next) => {
  if ((!req?.body?.email && !req?.body?.matric) || !req?.body?.password)
    return res
      .status(400)
      .json({ error: "'email/matric','password' are required fields." });

  const { email, matric, password } = req.body;

  try {
    let foundUser;
    let role;

    if (matric) {
      foundUser = await User.findOne({ matric }).exec();
      role = "Student";
    } else if (email) {
      foundUser = await User.findOne({ email }).exec();
      role = "Officer";
    }

    if (!foundUser)
      return res.status(401).json({ error: "Invalid credentials!" });

    const pwdCorrect = foundUser.password === password;

    if (!pwdCorrect)
      return res.status(401).json({ error: "Invalid credentials!" });

    const payload = { id: foundUser._id.toString(), roleID: foundUser.roleID };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: "2d",
    });

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      secure: false,
      sameSite: "Lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    }); // In production or when deploying, set "secure:true" && sameSite:"None" Else "secure:false" && sameSite:"Lax"

    res.json({
      message: "Login success",
      accessToken,
      role,
    });
  } catch (err) {
    next(err);
  }
};

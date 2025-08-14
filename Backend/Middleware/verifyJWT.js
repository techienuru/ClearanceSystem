import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../Config/secretKeys.js";

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res
      .status(401)
      .json({ error: "Unauthorized access. Please sign in first." });
  const token = authHeader.split(" ")[1];

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Token has expired.", isTokenExpired: true });

    req.id = decoded.id;
    req.roleID = decoded.roleID;

    next();
  });
};
export default verifyJWT;

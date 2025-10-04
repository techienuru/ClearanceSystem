import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/secretKeys.js";

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

    req.user_id = decoded.id;
    req.role = decoded.role;
    req.role_id = decoded.role_id;
    req.role_name = decoded.role_name;

    next();
  });
};
export default verifyJWT;

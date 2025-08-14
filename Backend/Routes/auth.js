import express from "express";
import { handleLogin } from "../Controllers/authControllers.js";

const authRoute = express.Router();

// All routes are preceeded with "/auth"
authRoute.post("/", handleLogin);

export default authRoute;

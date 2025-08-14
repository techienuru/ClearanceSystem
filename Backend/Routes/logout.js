import express from "express";
import { handleLogout } from "../controllers/logoutControllers.js";

const logoutRoute = express.Router();

logoutRoute.get("/", handleLogout);

export default logoutRoute;

import express from "express";
import refreshJWT from "../controllers/refreshTokenControllers.js";

const refreshRoute = express.Router();

refreshRoute.get("/", refreshJWT);

export default refreshRoute;

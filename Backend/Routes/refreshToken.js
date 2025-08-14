import express from "express";
import refreshJWT from "../Controllers/refreshTokenControllers.js";

const refreshRoute = express.Router();

refreshRoute.get("/", refreshJWT);

export default refreshRoute;

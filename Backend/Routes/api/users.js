import express from "express";
import { getUsersDetails } from "../../controllers/api/usersControllers.js";

const usersRoute = express.Router();

// All routes are preceeded with "/api/users"
usersRoute.get("/get-details", getUsersDetails);

export default usersRoute;

import express from "express";
import { getUsersDetails } from "../../Controllers/api/usersControllers.js";

const usersRoute = express.Router();

// All routes are preceeded with "/api/users"
usersRoute.get("/get-details", getUsersDetails);

export default usersRoute;

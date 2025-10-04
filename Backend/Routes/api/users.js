import express from "express";

import {
  getFile,
  getUsersDetails,
} from "../../Controllers/api/usersControllers.js";
import ROLES_LIST from "../../config/rolesList.js";
import verifyRole from "../../Middleware/verifyRoles.js";

const usersRoute = express.Router();

// All routes are preceeded with "/api/users"
usersRoute.get("/get-details", getUsersDetails);

usersRoute.get(
  "/clearance/files/:fileName",
  verifyRole(ROLES_LIST.Officer, ROLES_LIST.Student),
  getFile
);

export default usersRoute;

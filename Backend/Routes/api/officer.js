import express from "express";
import {
  addRequirement,
  deleteRequirement,
  getRequirements,
  getRoles,
} from "../../Controllers/api/officerControllers.js";
import ROLES_LIST from "../../config/rolesList.js";
import verifyRole from "../../Middleware/verifyRoles.js";

const officerRoute = express.Router();

// All routes are preceeded with "/api/officers"

officerRoute.get(
  "/roles",
  verifyRole(ROLES_LIST.Officer, ROLES_LIST.Student),
  getRoles
);

officerRoute
  .route("/requirements")
  .get(getRequirements)
  .post(verifyRole(ROLES_LIST.Officer), addRequirement);

officerRoute
  .route("/requirements/:req_id")
  .delete(verifyRole(ROLES_LIST.Officer), deleteRequirement);

export default officerRoute;

import express from "express";
import {
  addRequirement,
  deleteRequirement,
  getRequirements,
} from "../../Controllers/api/officerControllers.js";

const officerRoute = express.Router();

// All routes are preceeded with "/api/officers"
officerRoute.route("/requirements").get(getRequirements).post(addRequirement);

officerRoute.route("/requirements/:id").delete(deleteRequirement);

export default officerRoute;

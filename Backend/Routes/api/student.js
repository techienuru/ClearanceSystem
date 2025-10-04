import express from "express";
import {
  approveClearance,
  creditWallet,
  declineClearance,
  getAllClearanceProgress,
  getClearanceByRole,
  getClearanceProgress,
  getPendingClearance,
  getRequirement,
  getStudentClearance,
  getWalletDetails,
  payClearance,
  updateProfile,
  uploadClearance,
} from "../../Controllers/api/studentControllers.js";
import { upload } from "../../Middleware/uploadFile.js";
import ROLES_LIST from "../../config/rolesList.js";
import verifyRole from "../../Middleware/verifyRoles.js";

const studentRoute = express.Router();

// All routes are preceeded with "/api/students"
studentRoute.get("/wallet", verifyRole(ROLES_LIST.Student), getWalletDetails);

studentRoute.post(
  "/wallet/credit",
  verifyRole(ROLES_LIST.Student),
  creditWallet
);

studentRoute.get("/requirements/:role_id", getRequirement);

studentRoute.post(
  "/clearance/pay",
  verifyRole(ROLES_LIST.Student),
  payClearance
);

studentRoute.post(
  "/clearance/upload",
  verifyRole(ROLES_LIST.Student),
  upload.single("document"),
  uploadClearance
);

studentRoute.get(
  "/clearance/pending",
  verifyRole(ROLES_LIST.Officer),
  getPendingClearance
);

studentRoute.get(
  "/clearance/:studentId/all",
  verifyRole(ROLES_LIST.Officer),
  getStudentClearance
);

studentRoute.get(
  "/clearance/by-role/:role_id",
  verifyRole(ROLES_LIST.Student),
  getClearanceByRole
);

studentRoute.post(
  "/clearance/action/approve",
  verifyRole(ROLES_LIST.Officer),
  approveClearance
);

studentRoute.post(
  "/clearance/action/decline",
  verifyRole(ROLES_LIST.Officer),
  declineClearance
);

studentRoute.get(
  "/clearance/progress/:studentId/by-role/:roleId",
  verifyRole(ROLES_LIST.Student, ROLES_LIST.Admin),
  getClearanceProgress
);

studentRoute.get(
  "/clearance/progress/:studentId/all",
  verifyRole(ROLES_LIST.Student, ROLES_LIST.Admin, ROLES_LIST.Officer),
  getAllClearanceProgress
);

studentRoute.post(
  "/profile/update",
  verifyRole(ROLES_LIST.Student),
  updateProfile
);

export default studentRoute;

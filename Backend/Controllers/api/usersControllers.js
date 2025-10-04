import path from "node:path";
import fs from "fs/promises";

import { User } from "../../Models/User.js";
import Role from "../../Models/Role.js";
import Clearance from "../../Models/Clearance.js";
import Faculty from "../../Models/Faculty.js";
import Department from "../../Models/Department.js";

const __dirname = import.meta.dirname;
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "clearanceDocs");

export const getUsersDetails = async (req, res, next) => {
  const { user_id } = req;
  try {
    const foundUser = await User.findById(user_id)
      .populate("role_id")
      .select("-refreshToken -password -_v")
      .lean()
      .exec();

    if (!foundUser) return res.status(404).json({ error: "User not found" });

    let userData = { ...foundUser };

    // Populating Department & Faculty if User is a student
    if (foundUser.user_type === "Student") {
      const departmentDoc = await Department.findById(foundUser.department_id)
        .populate("faculty_id")
        .exec();

      userData.department_name = departmentDoc.department_name;
      userData.faculty_name = departmentDoc.faculty_id.faculty_name;
    }

    res.json({ message: "success", data: userData });
  } catch (err) {
    next(err);
  }
};

export const getFile = async (req, res, next) => {
  try {
    const { fileName } = req.params;

    const clearanceDoc = await Clearance.findOne(
      {
        "submissions.filename": fileName,
      },
      { submissions: { $elemMatch: { filename: fileName } } }
    )
      .lean()
      .exec();

    const filePath = path.join(UPLOAD_DIR, fileName);
    const { original_name, mimetype } = clearanceDoc.submissions[0];

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${original_name}"`
    );
    res.setHeader("Content-Type", mimetype);
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

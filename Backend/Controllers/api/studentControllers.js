import mongoose from "mongoose";
import { Student } from "../../Models/User.js";
import Role from "../../Models/Role.js";
import Requirement from "../../Models/Requirement.js";
import Clearance from "../../Models/Clearance.js";

import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";

const __dirname = import.meta.dirname;
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "clearanceDocs");

export const getWalletDetails = async (req, res, next) => {
  const { user_id } = req;
  if (!mongoose.isValidObjectId(user_id))
    return res.status(400).json({ error: "Invalid user_id!" });

  try {
    const foundDoc = await Student.findOne({ _id: user_id })
      .select("-__v -password -refreshToken")
      .lean()
      .exec();

    res.json({ message: "success", data: foundDoc });
  } catch (err) {
    next(err);
  }
};

export const creditWallet = async (req, res, next) => {
  if (!req?.body?.amount)
    return res.status(400).json({ error: "Missing required field 'amount'" });

  const rawAmount = req.body.amount;
  const amount = Number(rawAmount);
  const { user_id } = req;

  if (!mongoose.isValidObjectId(user_id))
    return res.status(400).json({ error: "Invalid userId" });

  if (typeof amount !== "number" || amount <= 0)
    return res.status(400).json({ error: "Amount must be a positive number" });

  try {
    const updated = await Student.findOneAndUpdate(
      { _id: user_id },
      { $inc: { "wallet.balance": amount } },
      { new: true, select: "-password -refreshToken" }
    )
      .lean()
      .exec();

    if (!updated)
      return res.status(404).json({ error: "User does not exist!" });

    res.json({ message: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

// Gets requirements (set by officer) for students
export const getRequirement = async (req, res, next) => {
  try {
    const { role_id } = req.params;
    const { user_id } = req;

    if (!mongoose.isValidObjectId(role_id))
      return res.status(400).json({ error: "Invalid role_id" });

    const requirementsDoc = await Requirement.find({ role_id })
      .populate("role_id")
      .lean()
      .exec();

    if (!requirementsDoc)
      return res.status(404).json({ error: "Requirement not found" });

    // Adding status = Paid if payment has already been made
    const CleanRequirementsDoc = await Promise.all(
      requirementsDoc.map(async (requirement) => {
        // If its an upload requirement, don't add status
        if (requirement.type !== "Payment") return requirement;

        const requirement_id = requirement._id;

        const clearanceExist = await Clearance.findOne({
          requirement_id,
          student_id: user_id,
          status: "Paid",
          role_id,
        })
          .lean()
          .exec();

        return clearanceExist
          ? { ...requirement, status: "Paid" }
          : requirement;
      })
    );

    res.json({ message: "success", data: CleanRequirementsDoc });
  } catch (err) {
    next(err);
  }
};

export const payClearance = async (req, res, next) => {
  try {
    if (!req?.body?.requirement_id || !req?.body?.role_id)
      return res.status(400).json({ error: "missing required field." });

    const { requirement_id, role_id } = req.body;
    const { user_id } = req;

    if (!mongoose.isValidObjectId(user_id))
      return res.status(400).json({ error: "Invalid user_id." });

    // Fetch the amount to debit from Requirement Collection
    const requirementDoc = await Requirement.findById(requirement_id)
      .lean()
      .exec();
    if (!requirementDoc)
      return res.status(404).json({ error: "Requirement doesn't exist." });
    const { amount } = requirementDoc;

    // Verify Student
    const foundUser = await Student.findById(user_id).lean().exec();
    if (!foundUser) return res.status(404).json({ error: "User not found" });

    // Debit User wallet
    const updatedDoc = await Student.findOneAndUpdate(
      { _id: user_id, "wallet.balance": { $gte: amount } },
      { $inc: { "wallet.balance": -amount } },
      { new: true, select: "-password -refreshToken -__v" }
    )
      .lean()
      .exec();

    if (!updatedDoc)
      return res
        .status(409)
        .json({ error: "Failed to debit wallet. Insufficient funds" });

    // Submit clearance (payment)
    const createdDoc = await Clearance.create({
      student_id: user_id,
      requirement_id,
      status: "Paid",
      role_id,
    });

    res.status(201).json({ message: "success", data: createdDoc });
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (filename) => {
  if (!filename) return;

  const fullPath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== "ENODE") {
      console.warn("Failed to delete file: ", fullPath, err.message);
    }
  }
};

export const uploadClearance = async (req, res, next) => {
  try {
    const file = req.file;

    if (!req?.body?.requirement_id || !req?.body?.role_id) {
      await deleteFile(file.filename);
      return res.status(400).json({ error: "Missing required field." });
    }

    if (!file) {
      return res.status(400).json({ error: "File required" });
    }

    const { requirement_id, role_id } = req.body;
    const { user_id } = req;

    // Validate IDs
    if (
      !mongoose.isValidObjectId(requirement_id) ||
      !mongoose.isValidObjectId(role_id) ||
      !mongoose.isValidObjectId(user_id)
    ) {
      await deleteFile(file.filename);
      return res.status(400).json({ error: "Invalid id provided." });
    }

    // Verify Requirement exixts
    const reqDoc = await Requirement.findById(requirement_id).lean().exec();
    if (!reqDoc) {
      await deleteFile(file.filename);
      return res.status(404).json({ error: "Requirement not found." });
    }

    // Verify Role exists
    const roleDoc = await Role.findById(role_id).lean().exec();
    if (!roleDoc) {
      await deleteFile(file.filename);
      return res.status(404).json({ error: "Role not found." });
    }

    // If clearance document status is pending, prevent another submission
    let isPendingDoc = await Clearance.findOne({
      student_id: user_id,
      requirement_id,
      status: "Pending",
    })
      .lean()
      .exec();

    if (isPendingDoc) {
      await deleteFile(file.filename);
      return res
        .status(409)
        .json({ error: "You have a pending document submitted." });
    }

    // Building submission object
    const submissionDoc = {
      filename: file.filename,
      original_name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    // Check if clearance exists
    let existingDoc = await Clearance.findOne({
      student_id: user_id,
      requirement_id,
    }).exec();

    if (existingDoc) {
      existingDoc.submissions.push(submissionDoc);
      existingDoc.status = "Pending";
      await existingDoc.save();
      return res.json({ message: "success", data: existingDoc });
    }

    // If clearance doesn't exist, create new
    const clearanceDoc = await Clearance.create({
      student_id: user_id,
      requirement_id,
      role_id,
      submissions: [submissionDoc],
      status: "Pending",
    });

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    try {
      await deleteFile(req.file.filename);
    } catch (delErr) {
      console.warn("Error deleting uploaded file.", delErr.message);
    }
    next(err);
  }
};

export const getPendingClearance = async (req, res, next) => {
  try {
    const role_id = new mongoose.Types.ObjectId(req.role_id);

    const clearanceDoc = await Clearance.aggregate([
      { $match: { role_id } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: "$student_id", clearance: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$clearance" } },
      {
        $lookup: {
          from: "user",
          localField: "student_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          "student.password": 0,
          "student.refreshToken": 0,
        },
      },
    ]);

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    next(err);
  }
};

export const getStudentClearance = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.studentId);
    const role_id = new mongoose.Types.ObjectId(req.role_id);

    const clearanceDoc = await Clearance.aggregate([
      { $match: { student_id: studentId, role_id } },
      {
        $lookup: {
          from: "user",
          localField: "student_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          "student.password": 0,
          "student.refreshToken": 0,
        },
      },
      {
        $lookup: {
          from: "requirement",
          localField: "requirement_id",
          foreignField: "_id",
          as: "requirement",
        },
      },
      { $unwind: "$requirement" },
    ]);

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    next(err);
  }
};

export const getClearanceByRole = async (req, res, next) => {
  try {
    const student_id = new mongoose.Types.ObjectId(req.user_id);
    const role_id = new mongoose.Types.ObjectId(req.params.role_id);

    const clearanceDoc = await Clearance.aggregate([
      { $match: { student_id: student_id, role_id: role_id } },
      {
        $lookup: {
          from: "role",
          localField: "role_id",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      {
        $lookup: {
          from: "requirement",
          localField: "requirement_id",
          foreignField: "_id",
          as: "requirement",
        },
      },
      { $unwind: "$requirement" },
    ]);

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    next(err);
  }
};

export const approveClearance = async (req, res, next) => {
  try {
    if (!req?.body?.clearance_id)
      return res.status(400).json({ error: "Missing required field" });

    const { clearance_id } = req.body;

    if (!mongoose.isValidObjectId(clearance_id))
      return res.status(400).json({ error: "Invalid clearance ID" });

    const clearanceDoc = await Clearance.findOneAndUpdate(
      { _id: clearance_id, status: { $ne: "Approved" } },
      { $set: { status: "Approved" } },
      { new: true }
    )
      .lean()
      .exec();

    if (!clearanceDoc || clearanceDoc.length === 0) {
      const isApproved = await Clearance.findOne({
        _id: clearance_id,
        status: "Approved",
      })
        .lean()
        .exec();

      if (isApproved)
        return res.status(409).json({ error: "Clearance already approved." });

      return res.status(400).json({ error: "Clearance not found." });
    }

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    next(err);
  }
};
export const declineClearance = async (req, res, next) => {
  try {
    if (!req?.body?.clearance_id || !req?.body?.feedback)
      return res.status(400).json({ error: "Missing required field" });

    const { clearance_id, feedback } = req.body;

    if (!mongoose.isValidObjectId(clearance_id))
      return res.status(400).json({ error: "Invalid clearance ID" });

    const clearanceDoc = await Clearance.findById(clearance_id).exec();

    if (!clearanceDoc)
      return res.status(400).json({ error: "Clearance not found." });

    const submissionsArr = clearanceDoc.submissions;
    const feedbackArr = clearanceDoc.feedback;

    // Checks if a feedback has already been dropped
    if (submissionsArr.length === feedbackArr.length)
      return res
        .status(409)
        .json({ error: "You have already submitted a feedback." });

    // Update the status and drop the feedback
    clearanceDoc.status = "Rejected";
    clearanceDoc.feedback.push(feedback);
    await clearanceDoc.save();

    res.json({ message: "success", data: clearanceDoc });
  } catch (err) {
    next(err);
  }
};

export const getClearanceProgress = async (req, res, next) => {
  try {
    const { studentId, roleId } = req.params;

    if (!mongoose.isValidObjectId(studentId))
      return res.status(400).json({ error: "Invalid Student ID" });

    if (!mongoose.isValidObjectId(roleId))
      return res.status(400).json({ error: "Invalid Role ID" });

    const requirementDoc = await Requirement.find({ role_id: roleId }).exec();

    // No. of requirements Officer dropped
    const noOfReq = requirementDoc.length || 0;

    const clearanceDoc = await Clearance.find({
      role_id: roleId,
      student_id: studentId,
      status: { $in: ["Approved", "Paid"] },
    }).exec();

    // No. of clearance (for that requirement) that has been passed
    const noOfApproved = clearanceDoc.length || 0;

    const clearanceScore = (noOfApproved * 100) / noOfReq;
    const clearanceProgress = clearanceScore === 100 ? "Approved" : "Pending";

    res.json({
      message: "success",
      data: { clearanceScore, clearanceProgress },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllClearanceProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId))
      return res.status(400).json({ error: "Invalid Student ID" });

    // Find roles that contain "Officer"
    const roles = await Role.find({ role_name: { $regex: /Officer/i } }).exec();

    let allClearanceProgress = await Promise.all(
      roles.map(async (role) => {
        const roleId = role._id;
        const roleName = role.role_name;

        const requirementDoc = await Requirement.find({
          role_id: roleId,
        }).exec();

        // No. of requirements Officer dropped
        const noOfReq = requirementDoc.length || 0;

        const clearanceDoc = await Clearance.find({
          role_id: roleId,
          student_id: studentId,
          status: { $in: ["Approved", "Paid"] },
        }).exec();

        // No. of clearance (for that requirement) that has been passed
        const noOfApproved = clearanceDoc.length || 0;

        // Avoid Division by zero
        const clearanceScore =
          noOfReq === 0 ? 0 : (noOfApproved * 100) / noOfReq;
        const clearanceProgress =
          clearanceScore === 100
            ? "Approved"
            : clearanceScore === 0
            ? "Not started"
            : "Pending";

        return {
          roleName,
          clearanceScore: Math.round(clearanceScore),
          clearanceProgress,
          noOfReq,
          noOfApproved,
        };
      })
    );

    res.json({
      message: "success",
      data: { allClearanceProgress },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { user_id } = req;
    if (!req?.body?.fullname || !req?.body?.email || !req?.body?.password)
      return res.status(400).json({
        error: "Missing required field (fullname,email or password).",
      });
    const { fullname, email, password } = req.body;

    const foundUser = await Student.findById(user_id).exec();
    if (!foundUser) return res.status(404).json({ error: "User not found." });

    const hashedPassword = await bcrypt.hash(password, 10);

    foundUser.fullname = fullname;
    foundUser.email = email;
    foundUser.password = hashedPassword;
    await foundUser.save();

    res.json({ message: "success", data: foundUser });
  } catch (err) {
    next(err);
  }
};

import mongoose from "mongoose";
import Requirement from "../../Models/Requirement.js";
import Clearance from "../../Models/Clearance.js";
import Role from "../../Models/Role.js";

export const getRoles = async (req, res, next) => {
  try {
    const rolesDoc = await Role.find({ role_name: { $regex: /Officer/i } })
      .select("-__v")
      .lean()
      .exec();

    if (!rolesDoc) return res.status(404).json({ error: "Roles not found!" });

    res.json({ message: "success", data: rolesDoc });
  } catch (err) {
    next(err);
  }
};

export const getRequirements = async (req, res, next) => {
  try {
    const { role_id } = req;

    const requirementsDoc = await Requirement.find({ role_id })
      .populate("role_id")
      .lean()
      .exec();

    res.json({ message: "success", requirementsDoc });
  } catch (err) {
    next(err);
  }
};

export const addRequirement = async (req, res, next) => {
  if (
    !req?.body?.title ||
    !req?.body?.type ||
    (!req?.body?.amount && !req?.body?.description)
  )
    return res.status(400).json({ error: "Missing required field." });

  const { title, type, amount, description } = req.body;
  const { role_id } = req;

  try {
    const result = await Requirement.create({
      title,
      type,
      amount,
      description,
      role_id,
    });
    res.json({ message: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteRequirement = async (req, res, next) => {
  const { req_id } = req.params;

  if (!mongoose.isValidObjectId(req_id))
    return res.status(400).json({ error: "Invalid requirement ID" });

  try {
    const deleted = await Requirement.findByIdAndDelete(req_id).exec();

    if (!deleted)
      return res.status(404).json({ error: "Requirement not found" });

    res.json({ message: "success", id: deleted._id });
  } catch (err) {
    next(err);
  }
};

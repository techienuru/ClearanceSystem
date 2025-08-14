import mongoose from "mongoose";
import Requirement from "../../Models/Requirement.js";

export const getRequirements = async (req, res, next) => {
  const { id, roleID } = req;

  try {
    const requirements = await Requirement.findOne({ roleID }).exec();

    res.json({ message: "success", requirements });
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
  const { id, roleID } = req;

  try {
    const result = await Requirement.create({
      title,
      type,
      amount,
      description,
      roleID,
    });
    res.json({ message: "success" });
  } catch (err) {
    next(err);
  }
};

export const deleteRequirement = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid requirement ID" });

  try {
    const foundRequirement = await Requirement.findById(id).exec();

    if (!foundRequirement)
      return res.status(404).json({ error: "Requirement not found" });

    const deleted = await Requirement.findByIdAndDelete(id).exec();

    res.json({ message: "success", id: deleted._id });
  } catch (err) {
    next(err);
  }
};

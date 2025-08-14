import User from "../../Models/User.js";
import Role from "../../Models/Role.js";

export const getUsersDetails = async (req, res, next) => {
  const { id, roleID } = req;
  try {
    const foundUser = await User.findById(id)
      .select("-refreshToken -password -_v")
      .lean();
    const userRole = await Role.findById(roleID).select("-__v").lean();

    if (!foundUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "success", user: foundUser, userRole });
  } catch (err) {
    next(err);
  }
};

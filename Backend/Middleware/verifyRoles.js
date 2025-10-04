const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.role;

    if (!allowedRoles.includes(userRole))
      return res.status(401).json({ error: "Access Denied. Not authorized!" });

    next();
  };
};

export default verifyRole;

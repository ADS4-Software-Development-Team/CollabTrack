const permit = (...allowed) => (req, res, next) => {
  // Support both `role` and `user_role` fields on the user record
  const user = req.user || {};
  const userRole = user.role || user.user_role || null;
  if (userRole && allowed.includes(userRole)) return next();
  return res.status(403).json({ error: 'Forbidden' });
};

export { permit };

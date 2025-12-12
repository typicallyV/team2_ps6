// middleware/authMiddleware.js
export const requireAuth = (req, res, next) => {
  console.log("🔐 requireAuth check:");
  console.log("  - Session:", req.session);
  console.log("  - isAuth:", req.session?.isAuth);
  console.log("  - SessionID:", req.sessionID);
  
  if (req.session?.isAuth) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
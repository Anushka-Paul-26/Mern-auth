import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    // Attach user info to req.user
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token. Login Again" });
  }
};

export default userAuth;

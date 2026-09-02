const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Member = require("../models/member.model");

// Admin auth protection
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized. No token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ghuk_super_secret_jwt_key_2026");

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

// Member auth protection
exports.protectMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ghuk_super_secret_jwt_key_2026");

    const member = await Member.findById(decoded.id);
    if (!member) {
      return res.status(401).json({ success: false, message: "Member account not found." });
    }

    if (member.status !== "approved") {
      return res.status(403).json({
        success: false,
        status: member.status,
        message: "Your membership access is not currently active.",
      });
    }

    req.member = member;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
  }
};

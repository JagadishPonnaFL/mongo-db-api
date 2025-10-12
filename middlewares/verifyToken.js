const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.name, // Assuming the token contains the user's ID
      name: decoded.name, // Assuming the token contains the user's name
      mobile: decoded.mobile,
    };
    next();
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = verifyToken;
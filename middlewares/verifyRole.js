const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Get role from the JWT payload

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access forbidden: insufficient permissions" });
        }
        
        next(); // Proceed if the role matches
    };
};

module.exports = verifyRole;
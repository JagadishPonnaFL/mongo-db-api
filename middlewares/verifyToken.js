const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract token from Authorization header (Bearer token)
    const token = req.header('Authorization')?.split(' ')[1];  // Split and get the token part
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        // Verify the token using the secret key from environment variables
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // Attach the decoded user data to the request object
        next();  // Pass control to the next middleware/route handler
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });  // Return generic error message
    }
};

module.exports = verifyToken;
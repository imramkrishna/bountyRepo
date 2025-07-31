const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    const decoded = jwt.verify(token, 'hardcoded-secret');
    req.user = decoded;
    next();
};

module.exports = authMiddleware;
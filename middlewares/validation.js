const validateUser = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    next();
};

module.exports = {
    validateUser,
    validateLogin
};

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }
            req.user = user;
            next();
            return;
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };


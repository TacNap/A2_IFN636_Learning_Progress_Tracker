
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, university, address, profileType } = req.body || {};
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await userRepository.createUser({
            name,
            email,
            password,
            university,
            address,
            profileType,
        });

        const dto = user.toDTO();
        res.status(201).json({ ...dto, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body || {};
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userRepository.validateCredentials(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const dto = user.toDTO();
        res.json({ ...dto, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.toDTO());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, email, university, address } = req.body || {};
        const user = await userRepository.updateProfile(req.user.id, { name, email, university, address });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dto = user.toDTO();
        res.json({ ...dto, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };


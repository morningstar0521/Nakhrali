const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const client = await pool.connect();
        try {
            const query = 'SELECT id, full_name, email, role FROM users WHERE id = $1';
            const result = await client.query(query, [decoded.id]);

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            req.user = result.rows[0];
            next();
        } finally {
            client.release();
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Role authorization
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};

// Generate JWT Token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

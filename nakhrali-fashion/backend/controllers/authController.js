const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const client = await pool.connect();
    try {
        const { fullName, email, phone, password, gender, dateOfBirth, newsletter, whatsapp } = req.body;

        // ===== COMPREHENSIVE INPUT VALIDATION =====
        
        // 1. Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide full name, email, and password'
            });
        }

        // 2. Validate and sanitize full name
        const trimmedName = fullName.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Full name must be at least 2 characters'
            });
        }
        if (trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Full name must be less than 100 characters'
            });
        }
        if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
            return res.status(400).json({
                success: false,
                message: 'Full name can only contain letters and spaces'
            });
        }

        // 3. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // 4. Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            });
        }

        // 5. Validate phone if provided
        if (phone) {
            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length !== 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 10 digits'
                });
            }
            if (!/^[6-9]/.test(phoneDigits)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must start with 6, 7, 8, or 9'
                });
            }
        }

        // 6. Validate date of birth if provided
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            
            if (isNaN(dob.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth'
                });
            }
            
            if (age < 13) {
                return res.status(400).json({
                    success: false,
                    message: 'You must be at least 13 years old to register'
                });
            }
            
            if (age > 150) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid date of birth'
                });
            }
        }

        // 7. Validate gender if provided
        if (gender && !['male', 'female', 'other', ''].includes(gender.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gender value'
            });
        }

        // Check if user exists
        const userExistsQuery = 'SELECT id FROM users WHERE email = $1';
        const userExists = await client.query(userExistsQuery, [email.toLowerCase()]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password with stronger salt rounds
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Sanitize and prepare data
        const sanitizedName = trimmedName.replace(/<[^>]*>/g, '');
        const sanitizedPhone = phone ? phone.replace(/\D/g, '') : null;

        // Create user
        const insertQuery = `
            INSERT INTO users (full_name, email, phone, password, gender, date_of_birth, newsletter, whatsapp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, full_name, email, phone, profile_picture, role, created_at
        `;

        const result = await client.query(insertQuery, [
            sanitizedName,
            email.toLowerCase(),
            sanitizedPhone,
            hashedPassword,
            gender ? gender.toLowerCase() : null,
            dateOfBirth || null,
            newsletter || false,
            whatsapp || false
        ]);

        const user = result.rows[0];

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profile_picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const query = 'SELECT id, full_name, email, phone, profile_picture, password, role FROM users WHERE email = $1';
        const result = await client.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profile_picture,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = 'SELECT id, full_name, email, phone, role, gender, date_of_birth, newsletter, whatsapp, created_at FROM users WHERE id = $1';
        const result = await client.query(query, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

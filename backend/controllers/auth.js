const { validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const rolePermissions = require('../config/roles');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    // Only admin or technical-admin can register via this endpoint
    if (!req.user || !['admin', 'technical-admin'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Not authorized to create accounts using /register' });
    }

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password, role: 'user' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ msg: 'Server misconfiguration: JWT secret missing' });
        }
        try {
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
            return res.json({ token });
        } catch (err) {
            console.error('JWT sign failed', err);
            return res.status(500).json({ msg: 'Server error' });
        }
        // Log audit: admin created a user via register
        try {
            if (req.user && req.user.id) {
                const log = new AuditLog({ action: 'create', targetModel: 'User', targetId: user._id, performedBy: req.user.id, details: { createdVia: 'register' } });
                await log.save();
            }
        } catch(err) {
            // audit failures should not block ops
            console.error('Audit log failed:', err.message);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Fail immediately if DB is not connected (avoids hanging request)
    if (require('mongoose').connection.readyState !== 1) {
        return res.status(503).json({ msg: 'Database connection unavailable' });
    }

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check for lockout
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ msg: `Account locked until ${new Date(user.lockUntil).toISOString()}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // increment failed attempt counter
            try {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                if (user.failedLoginAttempts >= 5) {
                    // lock account for 10 minutes
                    user.lockUntil = new Date(Date.now() + 10 * 60 * 1000);
                }
                await user.save();
            } catch (e) {
                console.error('Failed to update login attempts', e.message);
            }
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Reset failed attempts on success
        if (user.failedLoginAttempts) {
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ msg: 'Server misconfiguration: JWT secret missing' });
        }
        try {
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
            return res.json({ token });
        } catch (err) {
            console.error('JWT sign failed', err);
            return res.status(500).json({ msg: 'Server error' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Request password reset - sends token (for dev returns token in response)
const requestPasswordReset = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const crypto = require('crypto');
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        // In production you would email the token
        console.log(`[DEV ONLY] Password Reset Token for ${username}: ${token}`);
        res.json({ msg: 'Password reset token generated (check server logs for token)' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reset password using token
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ msg: 'Password reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get current authenticated user
const getUser = async (req, res) => {
    try {
        // For safety, return only necessary fields without password
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    register,
    login,
    getUser,
    requestPasswordReset,
    resetPassword
};

// Create user (admin-only or role-based creation)
const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role = 'employee', fullName } = req.body;

    try {
        // Ensure requester has permission to create the requested role
        const requesterRole = req.user.role;

        const allowed = (rolePermissions[requesterRole] || []).includes(role);
        if (!allowed) {
            return res.status(403).json({ msg: 'Not authorized to create this user role' });
        }

        let found = await User.findOne({ username });
        if (found) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = new User({ username, password, role, fullName });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        // audit log
        try {
            if (req.user && req.user.id) {
                const log = new AuditLog({ action: 'create', targetModel: 'User', targetId: newUser._id, performedBy: req.user.id, details: { role: newUser.role } });
                await log.save();
            }
        } catch (err) {
            console.error('Audit log failed:', err.message);
        }

        res.status(201).json({ msg: 'User created', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports.createUser = createUser;

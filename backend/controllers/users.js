const { validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const rolePermissions = require('../config/roles');

// List users - admin/technical-admin see all, manager/ceo see employees & users
// GET /api/users?search=&page=1&limit=20
const getUsers = async (req, res) => {
    try {
        const requesterRole = req.user.role;
        let query = {};
        const { page = 1, limit = 20, search = '', role } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        if (requesterRole === 'admin' || requesterRole === 'technical-admin') {
            query = {};
        } else if (['manager', 'ceo', 'hr'].includes(requesterRole)) {
            query = { role: { $in: ['employee', 'user'] } };
        } else {
            return res.status(403).json({ msg: 'Not authorized to view users' });
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ username: regex }, { fullName: regex }];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ username: 1 });

        return res.json({ users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// GET /api/users/heads - list users that can be assigned as heads (manager/ceo/hr/admin/technical-admin)
const getHeads = async (req, res) => {
    try {
        const heads = await User.find({ role: { $in: ['admin', 'technical-admin', 'manager', 'ceo', 'hr'] } }).select('username fullName role');
        return res.json({ users: heads });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user by id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Only admin, technical-admin or the user himself can access
        if (req.user.role === 'admin' || req.user.role === 'technical-admin' || req.user.id === user.id) {
            return res.json(user);
        }
        // manager/ceo/hr can access employees
        if ((['manager', 'ceo', 'hr'].includes(req.user.role)) && ['employee', 'user'].includes(user.role)) {
            return res.json(user);
        }
        return res.status(403).json({ msg: 'Not authorized' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
        res.status(500).send('Server Error');
    }
};

// Update user (role/fullName/password)
const updateUser = async (req, res) => {
    const { role, fullName, password } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Permissions: only tech-admin and admin can change role
        if (role && role !== user.role) {
            if (!['technical-admin', 'admin'].includes(req.user.role)) {
                return res.status(403).json({ msg: 'Not authorized to change role' });
            }
            user.role = role;
        }

        if (fullName) user.fullName = fullName;
        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const before = { role: user.role, fullName: user.fullName };
        await user.save();
        try {
            const log = new AuditLog({ action: 'update', targetModel: 'User', targetId: user._id, performedBy: req.user.id, details: { before, after: { role: user.role, fullName: user.fullName } } });
            await log.save();
        } catch (err) {
            console.error('Audit log failed:', err.message);
        }
        res.json({ msg: 'User updated', user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName } });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
        res.status(500).send('Server Error');
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Only technical-admin & admin can delete users
        if (!['technical-admin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ msg: 'Not authorized to delete users' });
        }
        // Prevent deleting yourself to avoid accidentally losing admin access
        if (req.user.id === user.id) {
            return res.status(400).json({ msg: 'Cannot delete your own user account' });
        }

        await User.findByIdAndDelete(req.params.id);
        try {
            const log = new AuditLog({ action: 'delete', targetModel: 'User', targetId: user._id, performedBy: req.user.id, details: { username: user.username } });
            await log.save();
        } catch (err) {
            console.error('Audit log failed:', err.message);
        }
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getUsers,
    getHeads,
    getUserById,
    updateUser,
    deleteUser
};

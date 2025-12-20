const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @route   GET api/auth
// @desc    Get logged in user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', [
    check('username', 'Username is required').exists(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    // Fail immediately if DB down
    if (require('mongoose').connection.readyState !== 1) {
        return res.status(503).json({ msg: 'Database connection unavailable' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ msg: 'Account is locked temporarily' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) user.lockUntil = Date.now() + 10 * 60 * 1000;
            await user.save();
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/register (Admin Only via this endpoint normally, but preserving logic)
router.post('/register', [
    auth,
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password min 6 chars').isLength({ min: 6 })
], async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'technical-admin') {
        return res.status(403).json({ msg: 'Not authorized' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, password, role: 'user' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ msg: 'User registered' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/create (Admin Create with Roles)
router.post('/create', [auth, check('username', 'Required').not().isEmpty()], async (req, res) => {
    const { username, password, role, fullName } = req.body;
    // Simple admin check
    if (!['admin', 'technical-admin', 'ceo', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Not authorized' });
    }
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, password, role: role || 'employee', fullName });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Audit
        await new AuditLog({
            action: 'create', targetModel: 'User', targetId: user.id,
            performedBy: req.user.id, details: { role }
        }).save().catch(e => console.log(e));

        res.json({ msg: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

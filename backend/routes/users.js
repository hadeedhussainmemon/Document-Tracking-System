const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/heads
// @desc    Get department heads / managers
router.get('/heads', auth, async (req, res) => {
    try {
        const heads = await User.find({ role: { $in: ['manager', 'ceo', 'technical-admin'] } }).select('username role');
        res.json(heads);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users
// @desc    Get all users
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/users/:id
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'technical-admin') {
        return res.status(403).json({ msg: 'Not authorized' });
    }
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// @route   GET api/auditlogs
router.get('/', auth, async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('performedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ logs, total: logs.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

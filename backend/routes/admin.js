const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/admin/stats
router.get('/stats', auth, async (req, res) => {
    res.json({ msg: 'Stats endpoint available' });
});

// route /api/admin/logs -> AuditLogs
router.use('/logs', require('./auditlogs'));

module.exports = router;

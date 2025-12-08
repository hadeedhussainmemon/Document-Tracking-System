const AuditLog = require('../models/AuditLog');

// GET /api/auditlogs?targetId=...
const listAuditLogs = async (req, res) => {
    const { targetId, limit = 50, skip = 0 } = req.query;
    try {
        const filter = {};
        if (targetId) filter.targetId = targetId;
        const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)).populate('performedBy', 'username role');
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { listAuditLogs };

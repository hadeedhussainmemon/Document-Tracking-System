const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { backfillPerformedByName } = require('../controllers/admin');

// POST /api/admin/backfill - protected admin action to run backfill
// POST /api/admin/backfill - protected admin action to run backfill
router.post('/backfill', auth, isAdmin, backfillPerformedByName);

// GET /api/admin/logs - view audit logs
const { getAuditLogs, getAuditLogsExport } = require('../controllers/admin');
router.get('/logs', auth, isAdmin, getAuditLogs);
router.get('/logs/export', auth, isAdmin, getAuditLogsExport);

module.exports = router;

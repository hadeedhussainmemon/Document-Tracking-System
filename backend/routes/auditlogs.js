const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listAuditLogs } = require('../controllers/auditlogs');

// @route GET /api/auditlogs
// @access Private
router.get('/', auth, listAuditLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { backfillPerformedByName } = require('../controllers/admin');

// POST /api/admin/backfill - protected admin action to run backfill
router.post('/backfill', auth, isAdmin, backfillPerformedByName);

module.exports = router;

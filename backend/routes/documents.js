const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const Counter = require('../models/Counter');
const User = require('../models/User');

// Helper: Get Next Sequence
const getNextSequence = async (name) => {
    const ret = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return ret.seq;
};

// @route   GET api/documents/stats
// @desc    Get dashboard stats
router.get('/stats', auth, async (req, res) => {
    try {
        const total = await Document.countDocuments();
        const pending = await Document.countDocuments({ status: 'Pending' });
        const approved = await Document.countDocuments({ status: 'Approved' });
        const rejected = await Document.countDocuments({ status: 'Rejected' });
        res.json({ total, pending, approved, rejected });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/documents
// @desc    Create a new document
router.post('/', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const seq = await getNextSequence('documentRef');
        const docRefShort = `DOC-${String(seq).padStart(6, '0')}`;

        // Use crypto for internal random ID
        const crypto = require('crypto');
        const docRef = `DOC-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

        const newDoc = new Document({
            title: req.body.title,
            content: req.body.content,
            priority: req.body.priority || 'Medium',
            docRef,
            docRefShort,
            creator: req.user.id,
            currentHolder: req.user.id, // Initially held by creator? Or workflow start?
            history: [{
                action: 'Created',
                performedBy: req.user.id,
                performedByName: 'User', // Populate later or fetch now
                comment: 'Document initialized'
            }]
        });

        const doc = await newDoc.save();
        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/documents
// @desc    Get all documents (with simple search)
router.get('/', auth, async (req, res) => {
    try {
        const search = req.query.search;
        let query = {};

        // If user is basic employee, maybe restrict? Assuming open visibility for now based on legacy app

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { docRefShort: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const documents = await Document.find(query)
            .populate('creator', 'username')
            .populate('currentHolder', 'username')
            .sort({ updatedAt: -1 });

        res.json(documents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/documents/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .populate('creator', 'username')
            .populate('history.performedBy', 'username')
            .populate('comments.user', 'username');

        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        res.json(doc);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Document not found' });
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/documents/:id/submit (Move Flow)
router.put('/:id/submit', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Not found' });

        // Logic: Move from Pending -> Submitted? Or just Generic Forward?
        // Implementing simple "Submit" (e.g. Employee -> Manager)
        doc.status = 'Pending'; // Or 'Submitted'
        doc.history.push({
            action: 'Submitted',
            performedBy: req.user.id,
            comment: req.body.comment || 'Submitted'
        });

        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/documents/:id/approve
router.put('/:id/approve', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Not found' });

        doc.status = 'Approved';
        doc.history.push({
            action: 'Approved',
            performedBy: req.user.id,
            comment: req.body.comment || 'Approved'
        });

        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/documents/:id/reject
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Not found' });

        doc.status = 'Rejected';
        doc.history.push({
            action: 'Rejected',
            performedBy: req.user.id,
            comment: req.body.comment || 'Rejected'
        });

        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/documents/:id/comments
router.post('/:id/comments', [auth, [check('text', 'Text is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const doc = await Document.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            user: req.user.id
        };
        doc.comments.unshift(newComment);
        await doc.save();
        res.json(doc.comments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/documents/:id/forward
router.post('/:id/forward', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Not found' });

        doc.status = 'Forwarded';
        doc.history.push({
            action: 'Forwarded',
            performedBy: req.user.id,
            comment: `Forwarded to ${req.body.role || 'User'}`
        });
        await doc.save();
        res.json(doc);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/documents/export
router.post('/export', auth, (req, res) => {
    // Stub: returning JSON for now, normally would generate PDF/CSV
    res.json({ msg: 'Export functionality stub' });
});

// @route   POST api/documents/bulk
router.post('/bulk', auth, async (req, res) => {
    const { action, ids } = req.body;
    try {
        if (action === 'delete') {
            await Document.deleteMany({ _id: { $in: ids } });
            return res.json({ msg: 'Bulk deleted' });
        }
        res.json({ msg: 'Bulk action completed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

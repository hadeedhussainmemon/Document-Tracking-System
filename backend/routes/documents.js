const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const {
    getDocuments,
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
} = require('../controllers/documents');
const { forwardDocument, exportDocuments, bulkAction } = require('../controllers/documents');

// Validation middleware for document creation and update
const documentValidation = [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
];

router.route('/')
    .get(auth, getDocuments)
    .post(auth, documentValidation, createDocument);

router.route('/:id')
    .get(auth, getDocumentById)
    .put(auth, documentValidation, updateDocument)
    .delete(auth, deleteDocument);

router.post('/:id/forward', auth, forwardDocument);
// Export CSV
router.post('/export', auth, exportDocuments);
// Bulk actions
router.post('/bulk', auth, bulkAction);

module.exports = router;

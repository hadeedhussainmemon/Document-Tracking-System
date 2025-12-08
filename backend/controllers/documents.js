const _ = require('lodash');
const { validationResult } = require('express-validator');
const Document = require('../models/Document');
const Counter = require('../models/Counter');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const generateRandomString = (len = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(len);
    let res = '';
    for (let i = 0; i < len; i++) {
        res += chars[bytes[i] % chars.length];
    }
    return res;
};

const generateId = (prefix, len = 10) => {
    try {
        if (crypto.randomUUID) {
            // Use crypto.randomUUID but shrink to requested length by base36 transformation
            const uuid = crypto.randomUUID().replace(/-/g, '');
            return `${prefix}-${uuid.slice(0, len)}`;
        }
    } catch (e) { /* ignore */ }
    return `${prefix}-${generateRandomString(len)}`;
};

const getDocuments = async (req, res) => {
    try {
        let query = {};

        // Build query from request parameters
        if (req.query.tags) {
            const tags = req.query.tags.split(',').map(tag => new RegExp(tag.trim(), 'i'));
            query.tags = { $in: tags };
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.owner) {
            query.owner = req.query.owner;
        }

        if (req.query.assignedTo) {
            query.assignedTo = req.query.assignedTo;
        }

        if (req.query.docRefShort) {
            // allow fuzzy match for docRefShort
            query.docRefShort = new RegExp(req.query.docRefShort, 'i');
        }

        if (req.query.metadata) {
            const metadataQuery = {};
            req.query.metadata.split(',').forEach(item => {
                const [key, value] = item.split(':');
                if (key && value) {
                    metadataQuery[`metadata.${key}`] = new RegExp(value.trim(), 'i');
                }
            });
            Object.assign(query, metadataQuery);
        }

        // text search on title or content
        if (req.query.text) {
            const regex = new RegExp(req.query.text.trim(), 'i');
            query.$or = (query.$or || []).concat([{ title: regex }, { content: regex }]);
        }

        // Apply role-based access control
        if (req.user.role !== 'admin') {
            // Define a role group where users can see each other's documents
            const roleGroup = ['admin', 'technical-admin', 'manager', 'ceo', 'hr'];
            if (roleGroup.includes(req.user.role)) {
                // find user ids for owners who belong to the roleGroup
                const owners = await User.find({ role: { $in: roleGroup } }).select('_id');
                const ownerIds = owners.map(o => o._id);
                query = {
                    ...query,
                    $or: [
                        { owner: req.user.id },
                        { 'accessControl.user': req.user.id },
                        { assignedTo: req.user.id },
                        { owner: { $in: ownerIds } }
                    ]
                };
            } else {
                query = {
                    ...query,
                    $or: [
                        { owner: req.user.id },
                        { 'accessControl.user': req.user.id }
                        ,{ assignedTo: req.user.id }
                    ]
                };
            }
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const skip = (page - 1) * limit;

        const total = await Document.countDocuments(query);

        const documents = await Document.find(query)
            .populate('owner', ['_id', 'username', 'role'])
            .populate('assignedTo', ['_id', 'username', 'fullName', 'role'])
            .populate('history.performedBy', ['username']);
        // Use Mongoose pagination properly
        const pagedDocs = await Document.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('owner', ['_id', 'username', 'role'])
            .populate('assignedTo', ['_id', 'username', 'fullName', 'role'])
            .populate('history.performedBy', ['username']);
        res.json({ documents: pagedDocs, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createDocument = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, metadata, accessControl } = req.body;

    try {
        let tagsArray = tags;
        if (tags && typeof tags === 'string') {
            tagsArray = tags.split(',').map(tag => tag.trim());
        }

            // if assignedTo provided without name, try to resolve
            let assignedToName = req.body.assignedToName || '';
            if (req.body.assignedTo && !assignedToName) {
                try {
                    const assignedUser = await User.findById(req.body.assignedTo).select('username');
                    if (assignedUser) assignedToName = assignedUser.username || '';
                } catch (err) { }
            }

            // generate short sequential docRef DOC-000012
            const getNextSequence = async name => {
                const updated = await Counter.findOneAndUpdate(
                    { _id: name },
                    { $inc: { seq: 1 } },
                    { new: true, upsert: true }
                );
                return updated.seq;
            };

            let docRefShort;
            try {
                const seq = await getNextSequence('documentRef');
                docRefShort = `DOC-${String(seq).padStart(6, '0')}`;
            } catch (e) {
                docRefShort = generateId('DOC', 10);
            }

            const newDocument = new Document({
            title,
            content,
            owner: req.user.id,
                assignedTo: req.body.assignedTo || undefined,
                assignedToName: assignedToName || undefined,
            tags: tagsArray || [],
            metadata: metadata || {},
            accessControl: accessControl || [],
            status: 'Open',
            docRef: generateId('DOC', 10),
                docRefShort,
            history: [{
                action: 'Created',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                eventId: generateId('EVT', 10),
                details: 'Document created'
            }]
        });

        const document = await newDocument.save();
        try {
            const log = new AuditLog({ action: 'create', targetModel: 'Document', targetId: document._id, performedBy: req.user.id, details: { title: document.title } });
            await log.save();
        } catch (err) {
            console.error('Audit logging failed:', err.message);
        }
        res.json(document);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('owner', ['_id', 'username', 'role'])
            .populate('assignedTo', ['_id', 'username', 'fullName', 'role'])
            .populate('history.performedBy', ['username']);

        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check user, admin role, or accessControl, or same-role-group visibility
        const isOwner = document.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const hasAccess = document.accessControl.some(ac =>
            ac.user.toString() === req.user.id && (ac.role === 'viewer' || ac.role === 'editor')
        );
        const roleGroup = ['admin', 'technical-admin', 'manager', 'ceo', 'hr'];
        const ownerRole = document.owner.role;
        const isRolePeer = ownerRole && roleGroup.includes(ownerRole) && roleGroup.includes(req.user.role);

        if (!isOwner && !isAdmin && !hasAccess && !isRolePeer) {
            return res.status(401).json({ msg: 'Not authorized to view this document' });
        }

        res.json(document);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Document not found' });
        }
        res.status(500).send('Server Error');
    }
};

const updateDocument = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, metadata, accessControl, status, assignedTo, closingMessage } = req.body;

    try {
        let document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check user, admin role, or editor access
        const isOwner = document.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isEditor = document.accessControl.some(ac =>
            ac.user.toString() === req.user.id && ac.role === 'editor'
        );

        if (!isOwner && !isAdmin && !isEditor) {
            return res.status(401).json({ msg: 'Not authorized to edit this document' });
        }

        let tagsArray = tags;
        if (tags && typeof tags === 'string') {
            tagsArray = tags.split(',').map(tag => tag.trim());
        }

        // Add current version to history if content has changed
        const hasContentChanged = document.content !== content || document.title !== title;
        const haveTagsChanged = !_.isEqual(document.tags.sort(), (tagsArray || []).sort());
        const hasMetadataChanged = !_.isEqual(document.metadata, metadata || {});
        
        if (hasContentChanged || haveTagsChanged || hasMetadataChanged) {
            document.versionHistory.push({
                content: document.content,
                editedBy: req.user.id,
                editedAt: new Date(),
            });
        }

        // History Tracking
        if (status && document.status !== status) {
            document.history.push({
                action: 'Status Change',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                eventId: generateId('EVT', 10),
                details: `Status changed from ${document.status} to ${status}`
            });
            document.status = status;
        }

        // If closing the document, require closing message
        if (status === 'Closed' && document.status === 'Closed') {
            // nothing
        }
        if (status === 'Closed' && document.status !== 'Closed') {
            if (!closingMessage || closingMessage.trim() === '') {
                return res.status(400).json({ msg: 'Closing message is required when closing a document' });
            }
            document.history.push({
                action: 'Closed',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                eventId: generateId('EVT', 10),
                details: `Closed: ${closingMessage}`
            });
            document.status = 'Closed';
            document.closedMessage = closingMessage;
            document.closedAt = new Date();
            document.closedBy = req.user.id;
        }

        if (accessControl && JSON.stringify(document.accessControl) !== JSON.stringify(accessControl)) {
                 document.history.push({
                action: 'Forwarded/Shared',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                    eventId: generateId('EVT', 10),
                details: 'Access control list updated'
            });
        }

        // If assignedTo changed, log it and update assignedToName
        if (assignedTo && String(document.assignedTo) !== String(assignedTo)) {
            let newAssignedToName = '';
            try {
                const newUser = await User.findById(assignedTo).select('username');
                newAssignedToName = newUser ? newUser.username : '';
            } catch (err) {}
            document.history.push({
                action: 'Assigned',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                eventId: generateId('EVT'),
                details: `Assigned to ${newAssignedToName || assignedTo}`
            });
            document.assignedTo = assignedTo;
            document.assignedToName = newAssignedToName;
        }

        if (hasContentChanged) {
                 document.history.push({
                action: 'Edited',
                performedBy: req.user.id,
                performedByName: req.user.username || '',
                     eventId: generateId('EVT', 10),
                details: 'Document content or title updated'
            });
        }
       
        document.title = title;
        document.content = content;
        document.tags = tagsArray || [];
        document.metadata = metadata || {};
        if (accessControl) document.accessControl = accessControl;

        await document.save();
        try {
            const log = new AuditLog({ action: 'update', targetModel: 'Document', targetId: document._id, performedBy: req.user.id, details: { title: document.title } });
            await log.save();
        } catch (err) {
            console.error('Audit logging failed:', err.message);
        }
        res.json(document);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Document not found' });
        }
        res.status(500).send('Server Error');
    }
};

const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check user or admin role (only owner or admin can delete)
        const isOwner = document.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ msg: 'Not authorized to delete this document' });
        }

        await document.remove();
        try {
            const log = new AuditLog({ action: 'delete', targetModel: 'Document', targetId: document._id, performedBy: req.user.id, details: { title: document.title } });
            await log.save();
        } catch (err) {
            console.error('Audit logging failed:', err.message);
        }
        res.json({ msg: 'Document removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Document not found' });
        }
        res.status(500).send('Server Error');
    }
};

const forwardDocument = async (req, res) => {
    const { toUserId, role = 'viewer' } = req.body;
    try {
        let document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }
        // Permission: only assignedTo (head) or owner or admin can forward
        const isOwner = document.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isAssignedHead = document.assignedTo && String(document.assignedTo) === req.user.id;
        if (!isOwner && !isAdmin && !isAssignedHead) {
            return res.status(403).json({ msg: 'Not authorized to forward this document' });
        }

        // Add to accessControl if not present
        const existing = document.accessControl.some(ac => String(ac.user) === String(toUserId));
        if (!existing) {
            document.accessControl.push({ user: toUserId, role });
        }

        // set assignedTo to forwarded user—so the new assigned head is set
        try {
            const newUser = await User.findById(toUserId).select('username');
            document.assignedTo = toUserId;
            document.assignedToName = newUser ? newUser.username : '';
        } catch (err) {
            // ignore
        }

        document.history.push({
            action: 'Forwarded',
            performedBy: req.user.id,
            performedByName: req.user.username || '',
            eventId: generateId('EVT'),
            details: `Forwarded to ${document.assignedToName || toUserId}`
        });

        await document.save();
        res.json(document);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Document not found' });
        res.status(500).send('Server Error');
    }
};

// Export documents as CSV - accepts { ids: [id1, id2], filters: { ... } }
const exportDocuments = async (req, res) => {
    try {
        const ids = req.body.ids || [];
        const filters = req.body.filters || {};
        let query = {};
        if (ids && ids.length > 0) {
            query._id = { $in: ids };
        } else {
            // apply any filter fields that are similar to getDocuments
            if (filters.status) query.status = filters.status;
            if (filters.owner) query.owner = filters.owner;
            if (filters.assignedTo) query.assignedTo = filters.assignedTo;
            if (filters.docRefShort) query.docRefShort = filters.docRefShort;
            if (filters.tags) query.tags = { $in: filters.tags.split(',').map(t => new RegExp(t.trim(), 'i')) };
        }

        // Get documents the requester is allowed to access
        // Reuse role-based logic similar to getDocuments
        if (req.user.role !== 'admin') {
            const roleGroup = ['admin', 'technical-admin', 'manager', 'ceo', 'hr'];
            if (roleGroup.includes(req.user.role)) {
                const owners = await User.find({ role: { $in: roleGroup } }).select('_id');
                const ownerIds = owners.map(o => o._id);
                query = { ...query, $or: [ { owner: req.user.id }, { 'accessControl.user': req.user.id }, { assignedTo: req.user.id }, { owner: { $in: ownerIds } } ] };
            } else {
                query = { ...query, $or: [{ owner: req.user.id }, { 'accessControl.user': req.user.id }, { assignedTo: req.user.id }] };
            }
        }

        const docs = await Document.find(query).populate('owner', ['username']).populate('assignedTo', ['username']);

        // Build CSV
        const csvRows = [];
        const headers = ['docRefShort', 'docRef', 'title', 'owner', 'assignedTo', 'status', 'createdAt', 'updatedAt', 'tags', 'metadata'];
        csvRows.push(headers.join(','));
        docs.forEach(d => {
            const row = [
                `"${d.docRefShort || ''}"`,
                `"${d.docRef || ''}"`,
                `"${(d.title || '').replace(/"/g, '""')}"`,
                `"${(d.owner && d.owner.username) || ''}"`,
                `"${(d.assignedTo && d.assignedTo.username) || ''}"`,
                `"${d.status || ''}"`,
                `"${d.createdAt ? d.createdAt.toISOString() : ''}"`,
                `"${d.updatedAt ? d.updatedAt.toISOString() : ''}"`,
                `"${(d.tags || []).join(';') || ''}"`,
                `"${JSON.stringify(d.metadata || {})}"`
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="documents.csv"');
        return res.send(csv);
    } catch (err) {
        console.error('Export failed:', err.message);
        return res.status(500).json({ msg: 'Export failed', error: err.message });
    }
};

// Bulk action: { action: 'delete'|'close'|'assign', ids: [], payload: optional }
const bulkAction = async (req, res) => {
    try {
        const { action, ids, payload } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ msg: 'No document ids provided' });
        const results = [];
        for (const id of ids) {
            const doc = await Document.findById(id);
            if (!doc) {
                results.push({ id, success: false, msg: 'Not found' });
                continue;
            }
            // Check permission: owner/admin or assigned head
            const isOwner = doc.owner && String(doc.owner) === req.user.id;
            const isAdmin = req.user.role === 'admin';
            const isEditor = doc.accessControl && doc.accessControl.some(ac => String(ac.user) === req.user.id && ac.role === 'editor');
            const isAssignedHead = doc.assignedTo && String(doc.assignedTo) === req.user.id;
            if (!isOwner && !isAdmin && !isEditor && !isAssignedHead) {
                results.push({ id, success: false, msg: 'Not authorized' });
                continue;
            }

            if (action === 'delete') {
                await doc.remove();
                results.push({ id, success: true, msg: 'Deleted' });
                continue;
            }

            if (action === 'close') {
                const closingMessage = payload && payload.closingMessage;
                if (!closingMessage) {
                    results.push({ id, success: false, msg: 'Missing closing message' });
                    continue;
                }
                doc.status = 'Closed';
                doc.closedMessage = closingMessage;
                doc.closedAt = new Date();
                doc.closedBy = req.user.id;
                doc.history.push({ action: 'Closed', performedBy: req.user.id, performedByName: req.user.username || '', eventId: generateId('EVT', 10), details: closingMessage });
                await doc.save();
                results.push({ id, success: true, msg: 'Closed' });
                continue;
            }

            if (action === 'assign') {
                const { assignedTo } = payload || {};
                if (!assignedTo) {
                    results.push({ id, success: false, msg: 'No assignedTo specified' });
                    continue;
                }
                doc.assignedTo = assignedTo;
                try { const userObj = await User.findById(assignedTo).select('username'); doc.assignedToName = userObj ? userObj.username : ''; } catch(e) {}
                doc.history.push({ action: 'Assigned', performedBy: req.user.id, performedByName: req.user.username || '', eventId: generateId('EVT', 10), details: `Assigned to ${doc.assignedToName || assignedTo}` });
                await doc.save();
                results.push({ id, success: true, msg: 'Assigned' });
                continue;
            }

            results.push({ id, success: false, msg: 'Unknown action' });
        }
        return res.json({ results });
    } catch (err) {
        console.error('Bulk action failed:', err);
        return res.status(500).json({ msg: 'Bulk action failed', error: err.message });
    }
};

module.exports = {
    getDocuments,
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    forwardDocument
    , exportDocuments, bulkAction
};

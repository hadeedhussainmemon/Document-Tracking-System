// backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    docRef: { type: String, unique: true, index: true, sparse: true },
    docRefShort: { type: String, unique: true, index: true, sparse: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String },
    tags: [{ type: String }], // Add tags field
    metadata: { type: mongoose.Schema.Types.Mixed }, // Add metadata field
    versionHistory: [{
        content: String,
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now },
    }],
    history: [{
        action: { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: { type: String },
        eventId: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: String }
    }],
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    closedMessage: { type: String },
    closedAt: { type: Date },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accessControl: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

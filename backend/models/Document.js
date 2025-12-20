const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    docRef: { type: String, unique: true }, // Internal GUID
    docRefShort: { type: String }, // Human Readable ID
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Forwarded'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    currentHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    workflow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow'
    },
    currentStep: { type: Number, default: 0 }, // 0 = Draft/Pending, 1 = Step 1...
    history: [{
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: String,
        timestamp: { type: Date, default: Date.now },
        comment: String,
        eventId: String
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        date: { type: Date, default: Date.now }
    }],
    versions: [{
        version: { type: Number, required: true },
        title: String,
        content: String,
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],
    currentVersion: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);

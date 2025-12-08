const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    targetModel: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

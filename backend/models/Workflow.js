const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    trigger: {
        priority: { type: String, enum: ['Low', 'Medium', 'High'] }
    },
    steps: [{
        order: Number, // 1, 2, 3...
        role: { type: String, enum: ['manager', 'technical-admin', 'ceo', 'admin'] },
        label: String // "Manager Approval"
    }]
});

module.exports = mongoose.model('Workflow', WorkflowSchema);

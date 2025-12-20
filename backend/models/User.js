const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'technical-admin', 'manager', 'employee', 'ceo', 'user'],
        default: 'employee'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
